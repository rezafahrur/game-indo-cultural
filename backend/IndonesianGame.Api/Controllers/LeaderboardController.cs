using IndonesianGame.Api.Contracts;
using IndonesianGame.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace IndonesianGame.Api.Controllers;

[ApiController]
[Route("api/leaderboard")]
public class LeaderboardController : ControllerBase
{
    private readonly GameService _game;
    public LeaderboardController(GameService game) => _game = game;

    [HttpGet]
    public async Task<ActionResult<List<LeaderboardEntry>>> Get([FromQuery] int take = 20)
        => Ok(await _game.GetLeaderboardAsync(Math.Clamp(take, 1, 100)));
}