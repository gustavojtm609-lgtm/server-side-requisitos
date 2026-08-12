import {
  getUserSummary,
  listLeaderboard,
  listUserHistory,
} from '../services/ranking.service.js';

export async function leaderboard(request, response) {
  const ranking = await listLeaderboard(request.validated.query);
  response.json({ success: true, data: ranking });
}

export async function history(request, response) {
  const games = await listUserHistory(
    request.auth.userId,
    request.validated.query,
  );
  response.json({ success: true, data: games });
}

export async function summary(request, response) {
  const statistics = await getUserSummary(request.auth.userId);
  response.json({ success: true, data: statistics });
}
