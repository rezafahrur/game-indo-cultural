using IndonesianGame.Api.Contracts;
using IndonesianGame.Api.Data;
using IndonesianGame.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IndonesianGame.Api.Services;

public class GameException : Exception
{
    public int StatusCode { get; }
    public GameException(string message, int statusCode = 400) : base(message)
        => StatusCode = statusCode;
}

public class GameService
{
    private readonly AppDbContext _db;
    private const int TotalSeconds = 60;
    private const int GraceSeconds = 2;

    public GameService(AppDbContext db) => _db = db;

    public async Task<StartSessionResponse> CreateSessionAsync(StartSessionRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.StudentId) || string.IsNullOrWhiteSpace(req.Name))
            throw new GameException("studentId and name are required");

        var studentId = req.StudentId.Trim();
        var name = req.Name.Trim();

        // Student ID: wajib angka, tepat 10 digit
        if (!System.Text.RegularExpressions.Regex.IsMatch(studentId, @"^\d{10}$"))
            throw new GameException("Student ID must be exactly 10 digits / 学号必须为10位数字");

        // Nama: 1–50 karakter
        if (name.Length < 1 || name.Length > 50)
            throw new GameException("Name must be 1–50 characters / 姓名长度必须为1–50个字符");

        // Nama: hanya huruf (Latin/CJK/dll), spasi, titik, strip, apostrof, middle dot
        if (!System.Text.RegularExpressions.Regex.IsMatch(
                name, @"^[\p{L}\p{M}\s\.\-'·]+$"))
            throw new GameException("Name contains invalid characters / 姓名包含无效字符");

        if (await _db.Sessions.AnyAsync(s => s.StudentId == studentId))
            throw new GameException("This student ID has already played", 409);

        var easy = await _db.Questions.Where(q => q.Difficulty == "Easy").Select(q => q.Id).ToListAsync();
        var medium = await _db.Questions.Where(q => q.Difficulty == "Medium").Select(q => q.Id).ToListAsync();
        if (easy.Count < 2 || medium.Count < 2) throw new GameException("Question bank not seeded");

        var chosen = easy.OrderBy(_ => Random.Shared.Next()).Take(2)
            .Concat(medium.OrderBy(_ => Random.Shared.Next()).Take(2))
            .OrderBy(_ => Random.Shared.Next())
            .ToList();

        var session = new GameSession
        {
            Id = Guid.NewGuid(),
            StudentId = studentId,
            Name = name,                 // ← pakai variabel yang sudah di-trim & divalidasi
            CreatedAt = DateTime.UtcNow,
            Status = "Ready"
        };
        for (var i = 0; i < chosen.Count; i++)
            session.Questions.Add(new SessionQuestion
            {
                Id = Guid.NewGuid(),
                QuestionId = chosen[i],
                OrderIndex = i
            });

        _db.Sessions.Add(session);
        await _db.SaveChangesAsync();
        return new StartSessionResponse(session.Id);
    }

    public async Task<BeginSessionResponse> BeginSessionAsync(Guid sessionId)
    {
        var session = await LoadSessionAsync(sessionId);

        if (session.Status == "Finished")
        {
            var answeredCount = session.Questions.Count(q => q.Answer != null);
            var correctCount = session.Questions.Count(q => q.Answer?.IsCorrect == true);
            return new BeginSessionResponse(
                session.Id, session.StartedAt ?? DateTime.UtcNow, DateTime.UtcNow,
                TotalSeconds, answeredCount, correctCount, true, BuildQuestionViews(session));
        }

        if (session.StartedAt == null)
        {
            session.StartedAt = DateTime.UtcNow;
            session.Status = "Playing";
            await _db.SaveChangesAsync();
        }

        var deadline = session.StartedAt.Value.AddSeconds(TotalSeconds);
        var now = DateTime.UtcNow;

        if (now >= deadline)
        {
            session.FinishedAt = deadline;
            session.DurationMs = TotalSeconds * 1000;
            session.Score = session.Questions.Count(q => q.Answer?.IsCorrect == true);
            session.Status = "Finished";
            await _db.SaveChangesAsync();

            var answered = session.Questions.Count(q => q.Answer != null);
            var correct = session.Questions.Count(q => q.Answer?.IsCorrect == true);
            return new BeginSessionResponse(
                session.Id, session.StartedAt.Value, DateTime.UtcNow,
                TotalSeconds, answered, correct, true, BuildQuestionViews(session));
        }

        var answered0 = session.Questions.Count(q => q.Answer != null);
        var correct0 = session.Questions.Count(q => q.Answer?.IsCorrect == true);
        return new BeginSessionResponse(
            session.Id, session.StartedAt.Value, DateTime.UtcNow,
            TotalSeconds, answered0, correct0, false, BuildQuestionViews(session));
    }

    public async Task<SubmitAnswerResponse> SubmitAnswerAsync(Guid sessionId, SubmitAnswerRequest req)
    {
        var session = await LoadSessionAsync(sessionId);
        if (session.Status != "Playing" || session.StartedAt == null)
            throw new GameException("Session is not playing", 409);

        if (DateTime.UtcNow > session.StartedAt.Value.AddSeconds(TotalSeconds + GraceSeconds))
            throw new GameException("Time is up", 409);

        var sq = session.Questions.FirstOrDefault(q => q.QuestionId == req.QuestionId)
            ?? throw new GameException("Question not part of session");
        if (sq.Answer != null) throw new GameException("Question already answered", 409);

        var option = sq.Question.Options.FirstOrDefault(o => o.Id == req.OptionId)
            ?? throw new GameException("Option not valid");

        var answeredAt = DateTime.UtcNow;
        _db.SessionAnswers.Add(new SessionAnswer
        {
            Id = Guid.NewGuid(),
            SessionQuestionId = sq.Id,
            OptionId = option.Id,
            IsCorrect = option.IsCorrect,
            AnsweredAt = answeredAt,
            TimeSpentMs = (long)(answeredAt - session.StartedAt.Value).TotalMilliseconds
        });
        await _db.SaveChangesAsync();

        var answered = await _db.SessionAnswers.CountAsync(a => a.SessionQuestion.SessionId == sessionId);
        return new SubmitAnswerResponse(option.IsCorrect, answered, session.Questions.Count, DateTime.UtcNow);
    }

    public async Task<FinishResponse> FinishAsync(Guid sessionId)
    {
        var session = await LoadSessionAsync(sessionId);
        if (session.Status == "Finished") return BuildFinish(session);
        if (session.StartedAt == null) throw new GameException("Session was never started");

        var deadline = session.StartedAt.Value.AddSeconds(TotalSeconds);
        var now = DateTime.UtcNow;
        var finished = now < deadline ? now : deadline;

        session.FinishedAt = finished;
        session.DurationMs = (long)(finished - session.StartedAt.Value).TotalMilliseconds;
        session.Score = session.Questions.Count(q => q.Answer?.IsCorrect == true);
        session.Status = "Finished";
        await _db.SaveChangesAsync();

        return BuildFinish(session);
    }

    public async Task<FinishResponse> GetResultAsync(Guid sessionId)
    {
        var session = await LoadSessionAsync(sessionId);
        if (session.Status != "Finished")
            throw new GameException("Session not finished yet", 409);
        return BuildFinish(session);
    }

    public async Task<List<LeaderboardEntry>> GetLeaderboardAsync(int take = 20)
    {
        var rows = await _db.Sessions
            .Where(s => s.Status == "Finished")
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.DurationMs)
            .ThenBy(s => s.FinishedAt)
            .Take(take)
            .Select(s => new { s.Name, s.StudentId, s.Score, s.DurationMs, s.FinishedAt })
            .ToListAsync();

        return rows.Select((r, i) => new LeaderboardEntry(
            i + 1,
            r.Name,
            Mask(r.StudentId),
            r.Score,
            r.DurationMs ?? 0,
            r.FinishedAt ?? DateTime.MinValue)).ToList();
    }

    private async Task<GameSession> LoadSessionAsync(Guid id) =>
        await _db.Sessions
            .Include(s => s.Questions).ThenInclude(q => q.Question).ThenInclude(q => q.Options)
            .Include(s => s.Questions).ThenInclude(q => q.Answer)
            .FirstOrDefaultAsync(s => s.Id == id)
        ?? throw new GameException("Session not found", 404);

    private static List<QuestionView> BuildQuestionViews(GameSession session) =>
        session.Questions
            .OrderBy(q => q.OrderIndex)
            .Select(sq => new QuestionView(
                sq.QuestionId,
                sq.OrderIndex,
                sq.Question.ImageUrl,
                sq.Question.TextEn,
                sq.Question.TextZh,
                sq.Answer?.OptionId,
                sq.Question.Options
                    .OrderBy(_ => Random.Shared.Next())
                    .Select(o => new OptionView(o.Id, o.TextEn, o.TextZh))
                    .ToList()))
            .ToList();

        private static FinishResponse BuildFinish(GameSession session)
        {
            var results = session.Questions
                .OrderBy(q => q.OrderIndex)
                .Select(sq =>
                {
                    var correct = sq.Question.Options.First(o => o.IsCorrect);
                    return new QuestionResultView(
                        sq.QuestionId,
                        sq.Question.TextEn,
                        sq.Question.TextZh,
                        correct.Id,
                        sq.Answer?.OptionId,
                        sq.Answer?.IsCorrect == true);
                })
                .ToList();

            return new FinishResponse(
                session.Id, session.Name, session.StudentId,
                session.Score, session.Questions.Count,
                session.DurationMs ?? 0, results);
        }
        private static string Mask(string id) =>
        id.Length <= 4 ? id : $"{id[..2]}***{id[^2..]}";
}