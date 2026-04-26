import React, { useState } from 'react';
import { downloadExcel } from '../lib/api';
import { Download, FileSpreadsheet } from 'lucide-react';

export default function ExcelDownload() {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async (type: 'authorized-capital' | 'full-report') => {
    setIsDownloading(true);
    try {
      downloadExcel(type);
    } catch (error) {
      console.error('Download failed', error);
      alert('Failed to download Excel report');
    } finally {
      setTimeout(() => setIsDownloading(false), 2000); // Give time for download to start
    }
  };

  return (
    <div style={{ display: 'flex', gap: '1rem' }}>
      <button 
        className="btn-primary"
        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
        onClick={() => handleDownload('full-report')}
        disabled={isDownloading}
      >
        <Download size={18} />
        Full AI Report
      </button>
    </div>
  );
}
