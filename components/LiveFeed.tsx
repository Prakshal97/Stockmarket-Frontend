import React, { useEffect, useState, useCallback } from 'react';
import { getAnnouncements, triggerPipeline } from '../lib/api';
import AnnouncementCard from './AnnouncementCard';
import FilterBar from './FilterBar';
import { RefreshCw, Play } from 'lucide-react';

interface LiveFeedProps {
  onStatsUpdate: () => void;
}

export default function LiveFeed({ onStatsUpdate }: LiveFeedProps) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [filters, setFilters] = useState({
    exchange: '',
    impact: '',
    sentiment: '',
    search: ''
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAnnouncements(filters);
      // Backend now returns { announcements: [...] }
      const raw = data.announcements || data.data || [];
      // Sort newest first by announcement_date
      const sorted = [...raw].sort((a, b) => {
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
    // Auto-refresh every 2 minutes
    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleManualTrigger = async () => {
    setTriggering(true);
    try {
      await triggerPipeline();
      alert('Pipeline triggered! It will run in the background.');
      setTimeout(fetchData, 5000); // Fetch again to see new data
    } catch (error) {
      console.error('Trigger failed:', error);
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>Live Processing Feed</h2>
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

      <FilterBar filters={filters} setFilters={setFilters} />

      {loading && announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ margin: '0 auto 1rem' }} />
          <p>Analyzing financial data...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>No announcements found matching the filters.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
          {announcements.map((ann) => (
            <AnnouncementCard key={ann.id} data={ann} />
          ))}
        </div>
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
