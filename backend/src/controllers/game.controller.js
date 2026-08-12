import {
  abandonGame,
  getActiveGame,
  getGameResult,
  listGameOptions,
  startGame,
  submitAnswer,
} from '../services/game.service.js';

export async function options(_request, response) {
  response.json({ success: true, data: await listGameOptions() });
}

export async function start(request, response) {
  const game = await startGame(request.auth.userId, request.validated.body);
  response.status(201).json({ success: true, data: game });
}

export async function active(request, response) {
  const game = await getActiveGame(request.auth.userId);
  response.json({ success: true, data: game });
}

export async function answer(request, response) {
  const game = await submitAnswer(
    request.auth.userId,
    request.validated.params.sessionId,
    request.validated.body.alternativeId,
  );
  response.json({ success: true, data: game });
}

export async function abandon(request, response) {
  const game = await abandonGame(
    request.auth.userId,
    request.validated.params.sessionId,
  );
  response.json({ success: true, data: game });
}

export async function result(request, response) {
  const gameResult = await getGameResult(
    request.auth.userId,
    request.validated.params.sessionId,
  );
  response.json({ success: true, data: gameResult });
}
