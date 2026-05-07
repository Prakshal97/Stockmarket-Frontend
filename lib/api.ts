import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://stockmarket-backend-1-kk4j.onrender.com';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
});

// ── PRIMARY: Authorized Capital ─────────────────────────────────────────────
export const getAuthorizedCapital = async (params = {}) => {
  const { data } = await api.get('/api/authorized-capital', { params });
  return data;
};

// ── NEW: Possible Capital (Context Signals) ──────────────────────────────────
export const getPossibleCapital = async (params = {}) => {
  const { data } = await api.get('/api/possible-capital', { params });
  return data;
};

// ── SECONDARY: General Announcements ────────────────────────────────────────
export const getAnnouncements = async (params = {}) => {
  const { data } = await api.get('/api/announcements', { params });
  return data;
};

// ── Stats ────────────────────────────────────────────────────────────────────
export const getStats = async () => {
  const { data } = await api.get('/api/stats');
  return data;
};

// ── Health Check ─────────────────────────────────────────────────────────────
export const getHealth = async () => {
  const { data } = await api.get('/health');
  return data;
};

// ── Debug Info ───────────────────────────────────────────────────────────────
export const getDebugInfo = async () => {
  const { data } = await api.get('/api/debug');
  return data;
};

// ── Excel Downloads ──────────────────────────────────────────────────────────
export const downloadExcel = (
  type: 'segregated-report' | 'authorized-capital' | 'full-report',
  params = {}
) => {
  const urlParams = new URLSearchParams(params as any).toString();
  const url = `${BASE_URL}/api/excel/${type}${urlParams ? '?' + urlParams : ''}`;
  window.location.href = url;
};

// ── Pipeline Trigger ─────────────────────────────────────────────────────────
export const triggerPipeline = async () => {
  const { data } = await api.post('/api/trigger');
  return data;
};

// ── Force Fetch (NSE/BSE latest 48 hours) ───────────────────────────────────
export const forceFetch = async (days: number = 2) => {
  const { data } = await api.post(`/api/force-fetch?days=${days}`);
  return data;
};

// ── Reprocess All Items ──────────────────────────────────────────────────────
export const reprocessAll = async () => {
  const { data } = await api.post('/api/reprocess');
  return data;
};

// ── Company Profile ──────────────────────────────────────────────────────────
export const getCompanyProfile = async (ticker: string, limit = 20) => {
  const { data } = await api.get(`/api/company/${ticker}`, { params: { limit } });
  return data;
};
