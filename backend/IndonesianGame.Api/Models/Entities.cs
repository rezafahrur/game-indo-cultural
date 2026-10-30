namespace IndonesianGame.Api.Models;

public class Question
{
    public Guid Id { get; set; }
    public string Difficulty { get; set; } = "Easy"; // Easy | Medium
    public string ImageUrl { get; set; } = "";
    public string TextEn { get; set; } = "";
    public string TextZh { get; set; } = "";
    public List<Option> Options { get; set; } = new();
}

public class Option
{
    public Guid Id { get; set; }
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public string TextEn { get; set; } = "";
    public string TextZh { get; set; } = "";
    public bool IsCorrect { get; set; }
}

public class GameSession
{
    public Guid Id { get; set; }
    public string StudentId { get; set; } = "";
    public string Name { get; set; } = "";
    public DateTime CreatedAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? FinishedAt { get; set; }
    public long? DurationMs { get; set; }
    public int Score { get; set; }
    public string Status { get; set; } = "Ready"; // Ready | Playing | Finished
    public List<SessionQuestion> Questions { get; set; } = new();
}

public class SessionQuestion
{
    public Guid Id { get; set; }
    public Guid SessionId { get; set; }
    public GameSession Session { get; set; } = null!;
    public Guid QuestionId { get; set; }
    public Question Question { get; set; } = null!;
    public int OrderIndex { get; set; }
    public SessionAnswer? Answer { get; set; }
}

public class SessionAnswer
{
    public Guid Id { get; set; }
    public Guid SessionQuestionId { get; set; }
    public SessionQuestion SessionQuestion { get; set; } = null!;
    public Guid OptionId { get; set; }
    public bool IsCorrect { get; set; }
    public DateTime AnsweredAt { get; set; }
    public long TimeSpentMs { get; set; }
}