import axios from 'axios';

const api = axios.create({
  // Default to production Render URL. Use .env.local to override for local development
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com/api',
});

export const getAnnouncements = async (params = {}) => {
  const { data } = await api.get('/announcements', { params });
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/stats');
  return data;
};

export const downloadExcel = (type: 'authorized-capital' | 'full-report', params = {}) => {
  const urlParams = new URLSearchParams(params as any).toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com/api';
  window.location.href = `${baseUrl}/excel/${type}?${urlParams}`;
};

export const triggerPipeline = async () => {
  const { data } = await api.post('/trigger');
  return data;
};
