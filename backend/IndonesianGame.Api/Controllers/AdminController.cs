using IndonesianGame.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace IndonesianGame.Api.Controllers;

[ApiController]
[Route("api/admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    public AdminController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    private bool Authorized() =>
        Request.Headers["X-Admin-Token"] == _config["AdminToken"];

    [HttpGet("sessions")]
    public async Task<IActionResult> Sessions()
    {
        if (!Authorized()) return Unauthorized();
        var rows = await _db.Sessions
            .OrderByDescending(s => s.CreatedAt)
            .Select(s => new
            {
                s.Id, s.StudentId, s.Name, s.Status,
                s.Score, s.DurationMs, s.CreatedAt, s.StartedAt, s.FinishedAt
            })
            .ToListAsync();
        return Ok(rows);
    }

    [HttpGet("winners")]
    public async Task<IActionResult> Winners()
    {
        if (!Authorized()) return Unauthorized();
        var rows = await _db.Sessions
            .Where(s => s.Status == "Finished")
            .OrderByDescending(s => s.Score)
            .ThenBy(s => s.DurationMs)
            .Select(s => new { s.StudentId, s.Name, s.Score, s.DurationMs, s.FinishedAt })
            .ToListAsync();
        return Ok(rows);
    }
}