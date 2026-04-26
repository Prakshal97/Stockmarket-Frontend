import React from 'react';
import { ExternalLink, Landmark, TrendingUp } from 'lucide-react';
import styles from './AuthCapitalTable.module.css';

interface AuthCapitalAnnouncement {
  id: string;
  company_name: string;
  ticker: string;
  exchange: string;
  announcement_date: string;
  board_approval: string;
  date_of_board_meeting: string;
  existing_auth_eq_cap_inr: number | null;
  new_auth_eq_cap_inr: number | null;
  proposed_increase_inr: number | null;
  cmp: number | null;
  market_cap_cr: number | null;
  sector: string;
  sentiment: string;
  ai_insight: string;
  trading_signal: string;
  source_url: string;
}

interface Props {
  announcements: AuthCapitalAnnouncement[];
}

const formatINR = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  const crores = val / 1_00_00_000;
  if (crores >= 1) return `₹${crores.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr`;
  const lakhs = val / 1_00_000;
  if (lakhs >= 1) return `₹${lakhs.toLocaleString('en-IN', { maximumFractionDigits: 2 })} L`;
  return `₹${val.toLocaleString('en-IN')}`;
};

const formatCMP = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return `₹${val.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const safe = (val: any, fallback = '—'): string => {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'null' || str.toLowerCase() === 'not available') return fallback;
  return str;
};

export default function AuthCapitalTable({ announcements }: Props) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Landmark size={40} style={{ opacity: 0.4 }} />
        <p>No Authorized Capital announcements in the last 24 hours.</p>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Landmark size={18} />
          <span>Authorized Capital Changes</span>
          <span className={styles.badge}>{announcements.length}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sr.</th>
              <th>Date</th>
              <th>Company</th>
              <th>Board</th>
              <th>D.O.B.M</th>
              <th>Existing Cap (INR)</th>
              <th>New Cap (INR)</th>
              <th>Increase (INR)</th>
              <th>CMP</th>
              <th>Market Cap</th>
              <th>Sector</th>
              <th>Remark +</th>
              <th>Remark −</th>
              <th>Action</th>
              <th>Link</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann, idx) => {
              const boardApproval = safe(ann.board_approval);
              const boardClass = boardApproval === 'Yes'
                ? styles.boardYes
                : boardApproval.includes('Pending')
                  ? styles.boardPending
                  : '';

              const sentiment = safe(ann.sentiment, 'Neutral');
              const insight = safe(ann.ai_insight, '');
              const remarkPositive = sentiment !== 'Negative' ? insight : '';
              const remarkNegative = sentiment === 'Negative' ? insight : '';

              const actionClass = sentiment === 'Positive'
                ? styles.actionPositive
                : sentiment === 'Negative'
                  ? styles.actionNegative
                  : styles.actionNeutral;

              return (
                <tr key={ann.id}>
                  <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{formatDate(ann.announcement_date)}</td>
                  <td className={styles.companyName} title={ann.company_name}>
                    {safe(ann.company_name)}
                  </td>
                  <td style={{ textAlign: 'center' }} className={boardClass}>{boardApproval}</td>
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{safe(ann.date_of_board_meeting)}</td>
                  <td className={styles.currencyCell}>{formatINR(ann.existing_auth_eq_cap_inr)}</td>
                  <td className={styles.currencyCell}>{formatINR(ann.new_auth_eq_cap_inr)}</td>
                  <td className={styles.currencyCell}>{formatINR(ann.proposed_increase_inr)}</td>
                  <td className={styles.currencyCell}>{formatCMP(ann.cmp)}</td>
                  <td className={styles.currencyCell}>
                    {ann.market_cap_cr ? `₹${ann.market_cap_cr.toLocaleString('en-IN', { maximumFractionDigits: 2 })} Cr` : '—'}
                  </td>
                  <td className={styles.sectorCell}>{safe(ann.sector)}</td>
                  <td className={styles.remarkCell}>{remarkPositive}</td>
                  <td className={styles.remarkCell}>{remarkNegative}</td>
                  <td className={actionClass}>{safe(ann.trading_signal)}</td>
                  <td className={styles.linkCell}>
                    <a href={ann.source_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={12} /> View
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
