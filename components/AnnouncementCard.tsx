import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, FileText, ArrowRight, AlertCircle, Zap, Shield, Brain, Calendar, CheckCircle, Clock } from 'lucide-react';
import styles from './AnnouncementCard.module.css';

interface AnnouncementProps {
  data: {
    id: string;
    exchange: string;
    company_name: string;
    ticker: string;
    announcement_type: string;
    title: string;
    description: string;
    announcement_date: string;
    key_details: string;
    revenue_profit_impact?: string;
    sentiment: string;
    impact_level: string;
    impact: string;
    board_approval: string;
    meeting_date: string;
    ai_insight: string;
    trading_signal: string;
    source_url: string;
    pdf_url?: string;
    created_at?: string;
    authorized_capital?: any;
    confidence_level?: string;
    classification_reason?: string;
    classifier_score?: number;
    extraction_method?: string;
  };
}

const safe = (val: any, fallback = 'Not Available'): string => {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'none' || str.toLowerCase() === 'n/a') return fallback;
  return str;
};

export default function AnnouncementCard({ data }: AnnouncementProps) {
  const dateStr = data.created_at || data.announcement_date;
  const date = dateStr ? new Date(dateStr) : new Date();
  
  const impactLevel = safe(data.impact_level || data.impact, 'Low');
  const sentiment = safe(data.sentiment, 'Neutral');
  const title = safe(data.title, 'ANNOUNCEMENT');
  const description = safe(data.description || data.key_details, 'No description available');
  const boardApproval = safe(data.board_approval);
  const meetingDate = safe(data.meeting_date);
  const aiInsight = safe(data.ai_insight);
  const companyName = safe(data.company_name, 'Unknown Company');
  const ticker = safe(data.ticker, '');
  const exchange = safe(data.exchange, 'NSE');
  const tradingSignal = safe(data.trading_signal, '');
  const sourceUrl = safe(data.source_url, '#');

  const getImpactIcon = () => {
    switch(impactLevel) {
      case 'High': return <AlertCircle size={13} />;
      case 'Medium': return <Zap size={13} />;
      case 'Low': return <Shield size={13} />;
      default: return <Shield size={13} />;
    }
  };

  const getSentimentLabel = () => {
    switch(sentiment) {
      case 'Positive': return '● Bullish';
      case 'Negative': return '● Bearish';
      case 'Neutral': return '● Neutral';
      default: return '● Neutral';
    }
  };

  return (
    <div className={`glass-panel ${styles.card} ${styles[`border${impactLevel}`]}`} id={`announcement-${data.id}`}>
      {/* ─── Header: Company + Tags ─── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.companyRow}>
            <h3 className={styles.companyName}>{companyName}</h3>
            <div className={styles.tags}>
              {ticker && ticker !== 'Not Available' && (
                <span className={styles.tickerTag}>{ticker}</span>
              )}
              <span className={`${styles.exchangeTag} ${styles[exchange.toLowerCase()]}`}>
                {exchange}
              </span>
            </div>
          </div>
          <div className={`${styles.sentimentLabel} ${styles[`sentiment${sentiment}`]}`}>
            {getSentimentLabel()}
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={`${styles.impactBadge} ${styles[`impact${impactLevel}`]}`}>
            {getImpactIcon()}
            <span>{impactLevel} Impact</span>
          </div>
        </div>
      </div>

      {/* ─── Title ─── */}
      <div className={styles.titleSection}>
        <div className={styles.titleLabel}>{title}</div>
        <div className={styles.typeLabel}>{safe(data.announcement_type, 'Other')}</div>
      </div>

      {/* ─── Description ─── */}
      <p className={styles.description}>{description}</p>

      {/* ─── Details Grid: Board Approval + Meeting Date ─── */}
      <div className={styles.detailsGrid}>
        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>
            <CheckCircle size={14} />
          </div>
          <div>
            <div className={styles.detailLabel}>Board Approval</div>
            <div className={styles.detailValue}>{boardApproval}</div>
          </div>
        </div>
        <div className={styles.detailItem}>
          <div className={styles.detailIcon}>
            <Calendar size={14} />
          </div>
          <div>
            <div className={styles.detailLabel}>Meeting Date</div>
            <div className={styles.detailValue}>{meetingDate}</div>
          </div>
        </div>
      </div>

      {/* ─── AI Insight ─── */}
      <div className={styles.insightBox}>
        <div className={styles.insightHeader}>
          <div className={styles.insightTitle}>
            <Brain size={15} />
            <span>AI Insight</span>
          </div>
          {tradingSignal && tradingSignal !== 'Not Available' && (
            <span className={styles.tradingSignal}>{tradingSignal}</span>
          )}
        </div>
        <p className={styles.insightText}>{aiInsight}</p>
      </div>

      {/* ─── Classification & Extraction Metadata ─── */}
      <div className={styles.metadataBox} style={{ marginTop: '0.8rem', padding: '0.8rem', background: 'rgba(0,0,0,0.15)', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span><strong>Confidence:</strong> {data.confidence_level || 'NONE'} ({data.classifier_score || 0})</span>
          <span><strong>Method:</strong> {data.extraction_method || 'none'}</span>
        </div>
        <div>
          <strong>Reason:</strong> {data.classification_reason || 'N/A'}
        </div>
      </div>

      {/* ─── Footer: Timestamp + Links ─── */}
      <div className={styles.footer}>
        <div className={styles.timestamp}>
          <Clock size={13} />
          <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
        </div>
        <div className={styles.actions}>
          {data.pdf_url && (
            <a href={data.pdf_url} target="_blank" rel="noreferrer" className={styles.actionLink}>
              <FileText size={13} /> PDF
            </a>
          )}
          <a href={sourceUrl} target="_blank" rel="noreferrer" className={styles.actionLink}>
            <ExternalLink size={13} /> Source <ArrowRight size={12} />
          </a>
        </div>
      </div>
    </div>
  );
}
