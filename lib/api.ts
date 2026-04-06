import axios from 'axios';

const api = axios.create({
  // Base domain only. Routes include /api/ prefix.
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com',
});

export const getAnnouncements = async (params = {}) => {
  const { data } = await api.get('/api/announcements', { params });
  return data;
};

export const getStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};

export const downloadExcel = (type: 'authorized-capital' | 'full-report', params = {}) => {
  const urlParams = new URLSearchParams(params as any).toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com';
  window.location.href = `${baseUrl}/api/excel/${type}?${urlParams}`;
};

export const triggerPipeline = async () => {
  const { data } = await api.post('/api/trigger');
  return data;
};
