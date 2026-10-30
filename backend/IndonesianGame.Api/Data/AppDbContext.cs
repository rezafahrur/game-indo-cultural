using IndonesianGame.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace IndonesianGame.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Question> Questions => Set<Question>();
    public DbSet<Option> Options => Set<Option>();
    public DbSet<GameSession> Sessions => Set<GameSession>();
    public DbSet<SessionQuestion> SessionQuestions => Set<SessionQuestion>();
    public DbSet<SessionAnswer> SessionAnswers => Set<SessionAnswer>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<GameSession>().HasIndex(s => s.StudentId).IsUnique();
        mb.Entity<SessionQuestion>().HasIndex(q => new { q.SessionId, q.OrderIndex }).IsUnique();
        mb.Entity<SessionAnswer>().HasIndex(a => a.SessionQuestionId).IsUnique();
    }
}