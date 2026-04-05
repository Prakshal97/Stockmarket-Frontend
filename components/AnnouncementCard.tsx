import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, ArrowRight, ExternalLink, FileText, AlertCircle, Zap, ShieldAlert } from 'lucide-react';
import styles from './AnnouncementCard.module.css';

interface AnnouncementProps {
  data: {
    id: string;
    exchange: string;
    company_name: string;
    ticker: string;
    announcement_type: string;
    announcement_date: string;
    key_details: string;
    revenue_profit_impact?: string;
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    impact_level: 'High' | 'Medium' | 'Low';
    ai_insight: string;
    trading_signal: string;
    source_url: string;
    pdf_url?: string;
    authorized_capital?: any;
  };
}

export default function AnnouncementCard({ data }: AnnouncementProps) {
  const date = data.announcement_date ? new Date(data.announcement_date) : new Date();
  
  const getImpactIcon = () => {
    switch(data.impact_level) {
      case 'High': return <AlertCircle size={14} />;
      case 'Medium': return <Zap size={14} />;
      case 'Low': return <ShieldAlert size={14} />;
      default: return null;
    }
  };

  const getImpactClass = () => {
    switch(data.impact_level) {
      case 'High': return styles.high;
      case 'Medium': return styles.medium;
      case 'Low': return styles.low;
      default: return '';
    }
  };

  return (
    <div className={`glass-panel ${styles.card}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.companyInfo}>
          <div className={`${styles.sentiment} ${styles[data.sentiment]}`} title={`Sentiment: ${data.sentiment}`}>
            <div className={styles.sentimentIndicator}></div>
          </div>
          <div className={styles.companyName}>
            {data.company_name}
            {data.ticker && <span className={styles.ticker}>{data.ticker}</span>}
            <span className={`${styles.exchange} ${data.exchange === 'NSE' ? styles.nse : styles.bse}`}>
              {data.exchange}
            </span>
          </div>
        </div>
        
        <div className={styles.badges}>
          <div className={`${styles.badge} ${getImpactClass()}`}>
            {getImpactIcon()}
            {data.impact_level} Impact
          </div>
        </div>
      </div>

      {/* Content */}
      <div>
        <div className={styles.type}>{data.announcement_type}</div>
        <div className={styles.content}>
          {data.key_details}
        </div>
        
        {data.revenue_profit_impact && (
          <div className={styles.financials}>
            <strong>Financial Impact:</strong> {data.revenue_profit_impact}
          </div>
        )}

        {data.announcement_type === 'Increase in Authorized Capital' && data.authorized_capital && (
          <div className={styles.financials}>
            <div><strong>Board Approval:</strong> {data.authorized_capital.board_approval} | <strong>Meeting Date:</strong> {data.authorized_capital.date_of_board_meeting}</div>
            {data.authorized_capital.proposed_increase_inr && (
              <div><strong>Proposed Increase:</strong> ₹{(data.authorized_capital.proposed_increase_inr / 10000000).toFixed(2)} Crore</div>
            )}
          </div>
        )}
      </div>

      {/* AI Insight */}
      {data.ai_insight && (
        <div className={styles.insight}>
          <div className={styles.insightTitle}>
            <span>🤖 AI Insight</span>
            {data.trading_signal && (
              <span className={styles.tradingSignal}>{data.trading_signal}</span>
            )}
          </div>
          <div className={styles.content}>{data.ai_insight}</div>
        </div>
      )}

      {/* Footer */}
      <div className={styles.footer}>
        <div>{formatDistanceToNow(date, { addSuffix: true })}</div>
        <div className={styles.actions}>
          {data.pdf_url && (
            <a href={data.pdf_url} target="_blank" rel="noreferrer" className={styles.link}>
              <FileText size={14} /> PDF
            </a>
          )}
          <a href={data.source_url} target="_blank" rel="noreferrer" className={styles.link}>
            <ExternalLink size={14} /> Source <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}
