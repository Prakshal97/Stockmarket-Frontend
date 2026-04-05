import React from 'react';
import styles from './FilterBar.module.css';

interface FilterProps {
  filters: {
    exchange: string;
    impact: string;
    sentiment: string;
    search: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<any>>;
}

export default function FilterBar({ filters, setFilters }: FilterProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <div className={styles.filterBar}>
      <input
        type="text"
        name="search"
        placeholder="Search company, ticker, or details..."
        value={filters.search}
        onChange={handleChange}
        className={styles.searchInput}
      />
      
      <select name="exchange" value={filters.exchange} onChange={handleChange} className={styles.select}>
        <option value="">All Exchanges</option>
        <option value="NSE">NSE Only</option>
        <option value="BSE">BSE Only</option>
      </select>

      <select name="impact" value={filters.impact} onChange={handleChange} className={styles.select}>
        <option value="">All Impacts</option>
        <option value="High">🔥 High Impact</option>
        <option value="Medium">⚡ Medium Impact</option>
        <option value="Low">💤 Low Impact</option>
      </select>

      <select name="sentiment" value={filters.sentiment} onChange={handleChange} className={styles.select}>
        <option value="">All Sentiments</option>
        <option value="Positive">🟢 Positive</option>
        <option value="Neutral">🟡 Neutral</option>
        <option value="Negative">🔴 Negative</option>
      </select>
    </div>
  );
}
