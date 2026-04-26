import React from 'react';
import styles from './StatsBar.module.css';

interface StatsProps {
  stats: {
    total_announcements: number;
    auth_capital_count?: number;
    general_count?: number;
    by_exchange?: Record<string, number>;
    by_sentiment?: Record<string, number>;
    by_impact?: Record<string, number>;
    last_fetched?: string;
  } | null;
}

export default function StatsBar({ stats }: StatsProps) {
  if (!stats) return null;

  const nseCount = stats.by_exchange?.NSE || 0;
  const bseCount = stats.by_exchange?.BSE || 0;

  const positiveCnt = stats.by_sentiment?.Positive || 0;
  const negativeCnt = stats.by_sentiment?.Negative || 0;

  const highImpact = stats.by_impact?.High || 0;
  const authCapCount = stats.auth_capital_count || 0;

  return (
    <div className={styles.statsContainer}>
      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statTitle}>Total Processed</div>
        <div className={styles.statValue}>{stats.total_announcements}</div>
        <div className={styles.statMeta}>
          <span>NSE: {nseCount}</span>
          <span>BSE: {bseCount}</span>
        </div>
      </div>

      <div className={`glass-panel ${styles.statCard} ${styles.authCard}`}>
        <div className={styles.statTitle}>🏛️ Auth Capital</div>
        <div className={styles.statValue}>{authCapCount}</div>
        <div className={styles.statMeta}>
          <span>Primary priority</span>
        </div>
      </div>

      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statTitle}>Market Sentiment</div>
        <div className={styles.statValue}>
          {positiveCnt >= negativeCnt ? 'Bullish' : 'Bearish'}
        </div>
        <div className={styles.statMeta}>
          <span className={styles.positive}>+{positiveCnt} Pos</span>
          <span className={styles.negative}>-{negativeCnt} Neg</span>
        </div>
      </div>

      <div className={`glass-panel ${styles.statCard}`}>
        <div className={styles.statTitle}>High Impact Events</div>
        <div className={styles.statValue}>{highImpact}</div>
        <div className={styles.statMeta}>
          <span>Require attention</span>
        </div>
      </div>
    </div>
  );
}
