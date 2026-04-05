'use client';

import { useEffect, useState, useCallback } from 'react';
import StatsBar from '../components/StatsBar';
import LiveFeed from '../components/LiveFeed';
import ExcelDownload from '../components/ExcelDownload';
import { getStats } from '../lib/api';
import { BrainCircuit } from 'lucide-react';

export default function Home() {
  const [stats, setStats] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <main className="container animate-fade-in">
      <header className="header">
        <div className="title-group">
          <h1>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-blue)' }}>
              <BrainCircuit size={40} />
              AlphaIntel Agent
            </span>
          </h1>
          <p>Real-time corporate announcement intelligence & AI extraction</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
          <ExcelDownload />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Data sourced from NSE & BSE | Powered by Gemini AI
          </div>
        </div>
      </header>

      <StatsBar stats={stats} />
      
      <div className="glass-panel" style={{ padding: '2rem', marginTop: '2rem' }}>
        <LiveFeed onStatsUpdate={fetchStats} />
      </div>
    </main>
  );
}
