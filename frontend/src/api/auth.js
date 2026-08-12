import { apiClient, apiData } from './client.js';

export const authApi = {
  async login(credentials) {
    return apiData(await apiClient.post('/auth/login', credentials));
  },

  async register(payload) {
    return apiData(await apiClient.post('/auth/register', payload));
  },

  async me() {
    return apiData(await apiClient.get('/auth/me'));
  },

  async refresh() {
    return apiData(await apiClient.post('/auth/refresh'));
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};

