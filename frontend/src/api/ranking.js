import { apiClient, apiData } from './client.js';

export const rankingApi = {
  async leaderboard(filters = {}) {
    return apiData(await apiClient.get('/rankings', { params: filters }));
  },

  async history(params = {}) {
    return apiData(await apiClient.get('/rankings/me/history', { params }));
  },

  async summary() {
    return apiData(await apiClient.get('/rankings/me/summary'));
  },
};

