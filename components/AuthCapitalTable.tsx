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
  confidence_level?: string;
  classification_reason?: string;
  classifier_score?: number;
  extraction_method?: string;
  raw_subject?: string;
  evidence_snippet?: string;
  ai_data?: {
    ai_insight?: string;
    existing_auth_eq_cap_inr?: number | string | null;
    new_auth_eq_cap_inr?: number | string | null;
    proposed_increase_inr?: number | string | null;
    percentage_increase?: number | string | null;
    face_value_inr?: number | string | null;
    confidence?: string;
    evidence_snippet?: string;
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
  verified: AuthCapitalAnnouncement[];
  possible: AuthCapitalAnnouncement[];
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

export default function AuthCapitalTable({ verified, possible }: Props) {
  const [subTab, setSubTab] = React.useState<'verified' | 'possible'>('verified');

  const currentList = subTab === 'verified' ? verified : possible;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div className={styles.sectionTitle}>
          <Landmark size={18} />
          <span>Authorized Capital Restructuring</span>
        </div>
        
        <div className={styles.tabGroup}>
          <button 
            className={`${styles.tabBtn} ${subTab === 'verified' ? styles.activeTab : ''}`}
            onClick={() => setSubTab('verified')}
          >
            Verified Proof ({verified.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${subTab === 'possible' ? styles.activeTab : ''}`}
            onClick={() => setSubTab('possible')}
          >
            Candidate Signals ({possible.length})
          </button>
        </div>
      </div>

      {currentList.length === 0 ? (
        <div className={styles.emptyState}>
          <Landmark size={32} style={{ opacity: 0.3 }} />
          <p>No {subTab} filings found in the current window.</p>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Company</th>
                <th>Evidence / Context</th>
                <th>Confidence</th>
                <th>Date</th>
                {subTab === 'verified' && (
                  <>
                    <th>Old Capital</th>
                    <th>New Capital</th>
                    <th>% Inc</th>
                  </>
                )}
                <th>Method</th>
                <th>PDF</th>
              </tr>
            </thead>
            <tbody>
              {currentList.map((ann) => {
                const { oldCap, newCap, pctInc } = resolveAnnouncementValues(ann);
                const confidence = ann.confidence_level || ann.ai_data?.confidence || 'NONE';
                const evidence = ann.evidence_snippet || ann.ai_data?.evidence_snippet || ann.classification_reason || ann.raw_subject;
                
                return (
                  <tr key={ann.id}>
                    <td className={styles.companyName}>
                      <strong>{safe(ann.company_name)}</strong>
                      <div className={styles.ticker}>{safe(ann.symbol)}</div>
                    </td>
                    <td className={styles.evidenceCell}>
                      <div className={styles.evidenceText} title={evidence}>
                        {safe(evidence)}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className={`${styles.badge} ${
                        confidence === 'HIGH' ? styles.badgeHigh : 
                        confidence === 'MEDIUM' ? styles.badgeMedium : 
                        styles.badgeLow
                      }`}>
                        {confidence}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', whiteSpace: 'nowrap' }}>{formatDate(ann.announcement_date)}</td>
                    
                    {subTab === 'verified' && (
                      <>
                        <td className={styles.currencyCell}>{formatINR(oldCap)}</td>
                        <td className={styles.currencyCell}>{formatINR(newCap)}</td>
                        <td style={{ textAlign: 'center' }}>
                          {pctInc ? `${pctInc.toFixed(1)}%` : '—'}
                        </td>
                      </>
                    )}

                    <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                      {ann.extraction_method || 'Title Scan'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {ann.pdf_url && (
                        <a href={ann.pdf_url} target="_blank" rel="noreferrer" className={styles.iconLink}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
