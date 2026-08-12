import { apiClient, apiData } from './client.js';

export const adminApi = {
  async listQuestions(params = {}) {
    return apiData(await apiClient.get('/admin/questions', { params }));
  },
  async createQuestion(payload) {
    return apiData(await apiClient.post('/admin/questions', payload));
  },
  async updateQuestion(id, payload) {
    return apiData(await apiClient.patch(`/admin/questions/${id}`, payload));
  },
  async archiveQuestion(id) {
    await apiClient.delete(`/admin/questions/${id}`);
  },
  async listThemes(params = {}) {
    return apiData(await apiClient.get('/admin/themes', { params }));
  },
};
