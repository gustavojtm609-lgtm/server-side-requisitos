import { apiClient, apiData } from './client.js';

export const gameApi = {
  async getOptions() {
    return apiData(await apiClient.get('/game/options'));
  },

  async getActive() {
    return apiData(await apiClient.get('/game/active'));
  },

  async start(configuration) {
    return apiData(await apiClient.post('/game/sessions', configuration));
  },

  async answer(sessionId, alternativeId) {
    return apiData(
      await apiClient.post(`/game/sessions/${sessionId}/answer`, {
        alternativeId,
      }),
    );
  },

  async abandon(sessionId) {
    return apiData(await apiClient.post(`/game/sessions/${sessionId}/abandon`));
  },

  async getResult(sessionId) {
    return apiData(await apiClient.get(`/game/sessions/${sessionId}/result`));
  },
};

