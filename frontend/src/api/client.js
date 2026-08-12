import axios from 'axios';
import { installMockApi } from './mock.js';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from './tokenStore.js';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  timeout: 10_000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

if (import.meta.env.VITE_USE_MOCK === 'true') {
  installMockApi(apiClient);
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshRequest = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const routeWithoutRefresh = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
    ].includes(originalRequest?.url);

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retried &&
      !routeWithoutRefresh
    ) {
      originalRequest._retried = true;

      try {
        refreshRequest ??= apiClient.post('/auth/refresh');
        const response = await refreshRequest;
        const token = response.data.data.accessToken;
        setAccessToken(token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        clearAccessToken();
        window.dispatchEvent(new Event('quiz:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        refreshRequest = null;
      }
    }

    return Promise.reject(error);
  },
);

export function apiData(response) {
  return response.data.data;
}

export function getApiErrorMessage(error, fallback = 'Não foi possível concluir a operação.') {
  return (
    error.response?.data?.error?.message ||
    (error.code === 'ECONNABORTED'
      ? 'A comunicação com o servidor excedeu o tempo limite.'
      : fallback)
  );
}
