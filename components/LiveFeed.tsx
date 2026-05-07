import React, { useEffect, useState, useCallback } from 'react';
import { getAnnouncements, getAuthorizedCapital, getPossibleCapital, forceFetch, triggerPipeline } from '../lib/api';
import AnnouncementCard from './AnnouncementCard';
import AuthCapitalTable from './AuthCapitalTable';
import FilterBar from './FilterBar';
import { RefreshCw, Play, Landmark, Megaphone, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface LiveFeedProps {
  onStatsUpdate: () => void;
}

export default function LiveFeed({ onStatsUpdate }: LiveFeedProps) {
  const [authCapital, setAuthCapital] = useState<any[]>([]);
  const [possibleCapital, setPossibleCapital] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'both' | 'auth' | 'general'>('both');
  const [filters, setFilters] = useState({
    exchange: '',
    impact: '',
    sentiment: '',
    search: ''
  });

  const showToast = (type: 'success' | 'error' | 'info', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const authPromise = getAuthorizedCapital({ limit: 100 });
      const possiblePromise = getPossibleCapital({ limit: 100 });
      const generalPromise = getAnnouncements({ ...filters, limit: 100 });

      const authData = await authPromise.catch((error) => {
        console.error('Error fetching authorized capital:', error);
        return { announcements: [] };
      });
      setAuthCapital(authData.announcements || []);

      const possibleData = await possiblePromise.catch((error) => {
        console.error('Error fetching possible capital:', error);
        return { announcements: [] };
      });
      setPossibleCapital(possibleData.announcements || []);

      const generalData = await generalPromise.catch((error) => {
        console.error('Error fetching general announcements:', error);
        return { announcements: [] };
      });
      const genRaw = generalData.announcements || generalData.data || [];
      const sorted = [...genRaw].sort((a: any, b: any) => {
        const dateA = new Date(a.announcement_date || a.created_at || 0).getTime();
        const dateB = new Date(b.announcement_date || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setAnnouncements(sorted);

      onStatsUpdate();
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showToast('error', 'Failed to fetch data. Is the backend running?');
    } finally {
      setLoading(false);
    }
  }, [filters, onStatsUpdate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000); // auto-refresh every 2 min
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleForceFetch = async () => {
    setTriggering(true);
    try {
      await forceFetch(2); // Keep forced sync aligned to 48 hours
      showToast('success', `Force-fetch triggered for the latest 48 hours! Refreshing in 15s...`);
      setTimeout(() => {
        fetchData();
        onStatsUpdate();
      }, 15000);
    } catch (error) {
      console.error('Force fetch failed:', error);
      // Fallback to regular trigger
      try {
        await triggerPipeline();
        showToast('info', 'Pipeline triggered! Refreshing in 10s...');
        setTimeout(fetchData, 10000);
      } catch {
        showToast('error', 'Trigger failed. Check backend connection.');
      }
    } finally {
      setTriggering(false);
    }
  };

  const tabStyle = (tab: string) => ({
    padding: '0.5rem 1.2rem',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: activeTab === tab ? 700 : 500,
    color: activeTab === tab ? '#fff' : 'var(--text-muted)',
    background: activeTab === tab
      ? tab === 'auth'
        ? 'linear-gradient(135deg, #10b981, #059669)'
        : tab === 'general'
          ? 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))'
          : 'linear-gradient(135deg, #6366f1, #8b5cf6)'
      : 'rgba(255,255,255,0.05)',
    border: activeTab === tab ? 'none' : '1px solid rgba(255,255,255,0.1)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
  });

  return (
    <div>
      {/* ── Toast Notification ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
          background: toast.type === 'success' ? '#065f46' : toast.type === 'error' ? '#7f1d1d' : '#1e3a5f',
          border: `1px solid ${toast.type === 'success' ? '#10b981' : toast.type === 'error' ? '#ef4444' : '#3b82f6'}`,
          color: '#fff', borderRadius: '10px', padding: '0.85rem 1.2rem',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', maxWidth: '380px', fontSize: '0.88rem',
          animation: 'fadeIn 0.3s ease',
        }}>
          {toast.type === 'success' && <CheckCircle2 size={16} color="#10b981" />}
          {toast.type === 'error' && <AlertTriangle size={16} color="#ef4444" />}
          {toast.type === 'info' && <RefreshCw size={16} color="#3b82f6" />}
          {toast.msg}
        </div>
      )}

      {/* ── Controls Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={tabStyle('both')} onClick={() => setActiveTab('both')}>
            Both
          </button>
          <button style={tabStyle('auth')} onClick={() => setActiveTab('auth')}>
            <Landmark size={14} /> Auth Capital ({authCapital.length + possibleCapital.length})
          </button>
          <button style={tabStyle('general')} onClick={() => setActiveTab('general')}>
            <Megaphone size={14} /> Other ({announcements.length})
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={fetchData}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button
            onClick={handleForceFetch}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', background: triggering ? '#4c1d95' : 'var(--accent-purple)' }}
            disabled={triggering}
          >
            <Play size={16} />
            {triggering ? 'Fetching...' : 'Force Fetch NSE/BSE'}
          </button>
        </div>
      </div>

      {/* ── Filter Bar (for general announcements) ── */}
      {(activeTab === 'both' || activeTab === 'general') && (
        <FilterBar filters={filters} setFilters={setFilters} />
      )}

      {/* ── Loading State ── */}
      {loading && authCapital.length === 0 && announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p>Analyzing financial data...</p>
        </div>
      ) : (
        <>
          {/* ════════ SECTION 1: AUTHORIZED CAPITAL (TOP PRIORITY) ════════ */}
          {(activeTab === 'both' || activeTab === 'auth') && (
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <AuthCapitalTable verified={authCapital} possible={possibleCapital} />
              {authCapital.length === 0 && !loading && (
                <div style={{
                  marginTop: '1rem', padding: '0.8rem 1.2rem',
                  background: 'rgba(251, 191, 36, 0.1)',
                  border: '1px solid rgba(251, 191, 36, 0.3)',
                  borderRadius: '8px', color: '#fbbf24', fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}>
                  <AlertTriangle size={14} />
                  No auth capital announcements in the last 48h.
                  Click <strong>"Force Fetch NSE/BSE"</strong> to pull fresh data from exchanges.
                </div>
              )}
            </div>
          )}

          {/* ════════ SECTION DIVIDER ════════ */}
          {activeTab === 'both' && announcements.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              margin: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.8rem'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Megaphone size={14} /> OTHER ANNOUNCEMENTS
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
            </div>
          )}

          {/* ════════ SECTION 2: GENERAL ANNOUNCEMENTS ════════ */}
          {(activeTab === 'both' || activeTab === 'general') && (
            announcements.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                <p>No announcements found matching the filters.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                {announcements.map((ann) => (
                  <AnnouncementCard key={ann.id} data={ann} />
                ))}
              </div>
            )
          )}
        </>
      )}

      <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
