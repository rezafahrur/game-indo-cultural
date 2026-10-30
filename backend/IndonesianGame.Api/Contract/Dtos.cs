namespace IndonesianGame.Api.Contracts;

public record StartSessionRequest(string StudentId, string Name);
public record StartSessionResponse(Guid SessionId);

public record BeginSessionResponse(
    Guid SessionId, DateTime StartedAt, DateTime ServerNow,
    int TotalSeconds, int AnsweredCount, int CorrectCount, bool IsFinished,
    List<QuestionView> Questions);

public record QuestionView(
    Guid QuestionId, int OrderIndex, string ImageUrl,
    string TextEn, string TextZh, Guid? SelectedOptionId, List<OptionView> Options);

public record OptionView(Guid OptionId, string TextEn, string TextZh);

public record SubmitAnswerRequest(Guid QuestionId, Guid OptionId);
public record SubmitAnswerResponse(bool IsCorrect, int AnsweredCount, int TotalQuestions, DateTime ServerNow);

public record FinishResponse(
    Guid SessionId, string Name, string StudentId,
    int Score, int Total, long DurationMs,
    List<QuestionResultView> Results);

public record QuestionResultView(
    Guid QuestionId, string TextEn, string TextZh,
    Guid CorrectOptionId, Guid? SelectedOptionId, bool IsCorrect);

public record LeaderboardEntry(
    int Rank, string Name, string StudentIdMasked,
    int Score, long DurationMs, DateTime FinishedAt);