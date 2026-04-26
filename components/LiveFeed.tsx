import React, { useEffect, useState, useCallback } from 'react';
import { getAnnouncements, getAuthorizedCapital, triggerPipeline } from '../lib/api';
import AnnouncementCard from './AnnouncementCard';
import AuthCapitalTable from './AuthCapitalTable';
import FilterBar from './FilterBar';
import { RefreshCw, Play, Landmark, Megaphone } from 'lucide-react';

interface LiveFeedProps {
  onStatsUpdate: () => void;
}

export default function LiveFeed({ onStatsUpdate }: LiveFeedProps) {
  const [authCapital, setAuthCapital] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [activeTab, setActiveTab] = useState<'both' | 'auth' | 'general'>('both');
  const [filters, setFilters] = useState({
    exchange: '',
    impact: '',
    sentiment: '',
    search: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both collections in parallel
      const [authData, generalData] = await Promise.all([
        getAuthorizedCapital(),
        getAnnouncements(filters)
      ]);

      // Auth capital
      const authRaw = authData.announcements || [];
      setAuthCapital(authRaw);

      // General
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
    } finally {
      setLoading(false);
    }
  }, [filters, onStatsUpdate]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualTrigger = async () => {
    setTriggering(true);
    try {
      await triggerPipeline();
      alert('Segregated pipeline triggered! Data will refresh shortly.');
      setTimeout(fetchData, 5000);
    } catch (error) {
      console.error('Trigger failed:', error);
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
      {/* ── Controls Bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        {/* Tab Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button style={tabStyle('both')} onClick={() => setActiveTab('both')}>
            Both
          </button>
          <button style={tabStyle('auth')} onClick={() => setActiveTab('auth')}>
            <Landmark size={14} /> Auth Capital ({authCapital.length})
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
            onClick={handleManualTrigger}
            className="btn-primary"
            style={{ padding: '0.5rem 1rem', background: 'var(--accent-purple)' }}
            disabled={triggering}
          >
            <Play size={16} />
            {triggering ? 'Triggering...' : 'Force Fetch NSE/BSE'}
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
              <AuthCapitalTable announcements={authCapital} />
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
      `}</style>
    </div>
  );
}
