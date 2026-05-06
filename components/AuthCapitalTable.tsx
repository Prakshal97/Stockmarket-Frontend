import React from 'react';
import { ExternalLink, Landmark } from 'lucide-react';
import styles from './AuthCapitalTable.module.css';

interface AuthCapitalAnnouncement {
  id: string;
  company_name: string;
  symbol: string;
  exchange: string;
  announcement_date: string;
  old_capital_inr: number | null;
  new_capital_inr: number | null;
  increase_amount_inr: number | null;
  percentage_increase: number | null;
  source_url: string;
  pdf_url?: string;
  auth_data?: {
    existing_auth_eq_cap_inr?: number | string | null;
    new_auth_eq_cap_inr?: number | string | null;
    proposed_increase_inr?: number | string | null;
    percentage_increase?: number | string | null;
    face_value_inr?: number | string | null;
  };
  excel_row?: {
    existing_auth_eq_cap_inr?: number | string | null;
    new_auth_eq_cap_inr?: number | string | null;
    proposed_increase_inr?: number | string | null;
    percentage_increase?: number | string | null;
    face_value_inr?: number | string | null;
  };
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

const pickNumber = (...values: any[]): number | null => {
  for (const value of values) {
    if (value === null || value === undefined || value === '') continue;
    const num = typeof value === 'string' ? Number(String(value).replace(/[₹,]/g, '').trim()) : Number(value);
    if (!Number.isNaN(num)) return num;
  }
  return null;
};

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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

const resolveAnnouncementValues = (ann: AuthCapitalAnnouncement) => {
  const oldCap = pickNumber(
    ann.old_capital_inr,
    ann.auth_data?.existing_auth_eq_cap_inr,
    ann.excel_row?.existing_auth_eq_cap_inr
  );
  const newCap = pickNumber(
    ann.new_capital_inr,
    ann.auth_data?.new_auth_eq_cap_inr,
    ann.excel_row?.new_auth_eq_cap_inr
  );
  const incAmt = pickNumber(
    ann.increase_amount_inr,
    ann.auth_data?.proposed_increase_inr,
    ann.excel_row?.proposed_increase_inr
  );
  const pctInc = pickNumber(
    ann.percentage_increase,
    ann.auth_data?.percentage_increase,
    ann.excel_row?.percentage_increase
  );

  return { oldCap, newCap, incAmt, pctInc };
};

export default function AuthCapitalTable({ announcements }: Props) {
  if (!announcements || announcements.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Landmark size={40} style={{ opacity: 0.4 }} />
        <p>No Authorized Capital announcements in the last 48 hours.</p>
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
              <th>Company</th>
              <th>Symbol</th>
              <th>Exchange</th>
              <th>Date</th>
              <th>Old Capital</th>
              <th>New Capital</th>
              <th>Increase Amount</th>
              <th>% Increase</th>
              <th>Source URL</th>
              <th>PDF URL</th>
            </tr>
          </thead>
          <tbody>
            {announcements.map((ann) => {
              const { oldCap, newCap, incAmt, pctInc } = resolveAnnouncementValues(ann);
              return (
              <tr key={ann.id}>
                <td className={styles.companyName} title={ann.company_name}>
                  {safe(ann.company_name)}
                </td>
                <td style={{ textAlign: 'center' }}>{safe(ann.symbol)}</td>
                <td style={{ textAlign: 'center' }}>{safe(ann.exchange)}</td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{formatDate(ann.announcement_date)}</td>
                <td className={styles.currencyCell}>{formatINR(oldCap)}</td>
                <td className={styles.currencyCell}>{formatINR(newCap)}</td>
                <td className={styles.currencyCell}>{formatINR(incAmt)}</td>
                <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>
                  {pctInc === null || pctInc === undefined
                    ? '—'
                    : `${Number(pctInc).toFixed(2)}%`}
                </td>
                <td className={styles.linkCell}>
                  <a href={ann.source_url} target="_blank" rel="noreferrer">
                    <ExternalLink size={12} /> View
                  </a>
                </td>
                <td className={styles.linkCell}>
                  {ann.pdf_url ? (
                    <a href={ann.pdf_url} target="_blank" rel="noreferrer">
                      <ExternalLink size={12} /> PDF
                    </a>
                  ) : (
                    '—'
                  )}
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
