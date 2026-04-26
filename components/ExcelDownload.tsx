import React, { useState } from 'react';
import { downloadExcel } from '../lib/api';
import { Download, FileSpreadsheet, Landmark } from 'lucide-react';

export default function ExcelDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (type: 'segregated-report' | 'authorized-capital' | 'full-report') => {
    setIsDownloading(true);
    try {
      downloadExcel(type);
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download Excel report');
    } finally {
      setTimeout(() => setIsDownloading(false), 2000);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
      <button
        className="btn-primary"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        onClick={() => handleDownload('segregated-report')}
        disabled={isDownloading}
      >
        <FileSpreadsheet size={18} />
        Segregated Report
      </button>
      <button
        className="btn-primary"
        style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', fontSize: '0.85rem', padding: '0.6rem 1rem' }}
        onClick={() => handleDownload('authorized-capital')}
        disabled={isDownloading}
      >
        <Landmark size={16} />
        Auth Capital Only
      </button>
    </div>
  );
}
