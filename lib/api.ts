import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com',
});

// ── PRIMARY: Authorized Capital ─────────────────────────────────────────

export const getAuthorizedCapital = async (params = {}) => {
  const { data } = await api.get('/api/authorized-capital', { params });
  return data;
};

// ── SECONDARY: General Announcements ────────────────────────────────────

export const getAnnouncements = async (params = {}) => {
  const { data } = await api.get('/api/announcements', { params });
  return data;
};

// ── Stats ───────────────────────────────────────────────────────────────

export const getStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};

// ── Excel Downloads ─────────────────────────────────────────────────────

export const downloadExcel = (type: 'segregated-report' | 'authorized-capital' | 'full-report', params = {}) => {
  const urlParams = new URLSearchParams(params as any).toString();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com';
  window.location.href = `${baseUrl}/api/excel/${type}?${urlParams}`;
};

// ── Pipeline Trigger ────────────────────────────────────────────────────

export const triggerPipeline = async () => {
  const { data } = await api.post('/api/trigger');
  return data;
};
