using IndonesianGame.Api.Contracts;
using IndonesianGame.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace IndonesianGame.Api.Controllers;

[ApiController]
[Route("api/sessions")]
public class SessionsController : ControllerBase
{
    private readonly GameService _game;
    public SessionsController(GameService game) => _game = game;

    [HttpPost]
    public async Task<ActionResult<StartSessionResponse>> Create([FromBody] StartSessionRequest req)
        => Ok(await _game.CreateSessionAsync(req));

    [HttpPost("{id:guid}/begin")]
    public async Task<ActionResult<BeginSessionResponse>> Begin(Guid id)
        => Ok(await _game.BeginSessionAsync(id));

    [HttpPost("{id:guid}/answer")]
    public async Task<ActionResult<SubmitAnswerResponse>> Answer(Guid id, [FromBody] SubmitAnswerRequest req)
        => Ok(await _game.SubmitAnswerAsync(id, req));

    [HttpPost("{id:guid}/finish")]
    public async Task<ActionResult<FinishResponse>> Finish(Guid id)
        => Ok(await _game.FinishAsync(id));

    [HttpGet("{id:guid}/result")]
    public async Task<ActionResult<FinishResponse>> Result(Guid id)
        => Ok(await _game.GetResultAsync(id));
}