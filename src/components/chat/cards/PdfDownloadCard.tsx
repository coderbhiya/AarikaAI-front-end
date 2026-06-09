import React, { useState } from 'react';
import { Download, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface PdfDownloadCardProps {
  url: string;
  fileName: string;
}

const PdfDownloadCard: React.FC<PdfDownloadCardProps> = ({ url, fileName }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await axiosInstance.get(url, {
        responseType: 'blob', // Important to handle the binary data correctly
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error("Download failed", error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm w-full max-w-sm flex items-center justify-between">
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0 border border-red-100">
          <FileText className="text-red-500" size={20} />
        </div>
        <div className="min-w-0 pr-2">
          <h4 className="text-sm font-semibold text-gray-900 truncate" title={fileName}>
            {fileName}
          </h4>
          <p className="text-xs text-gray-500">PDF Document</p>
        </div>
      </div>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="shrink-0 flex items-center justify-center w-10 h-10 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:bg-primary hover:text-white hover:border-primary transition-colors focus:outline-none"
      >
        {isDownloading ? (
          <Loader2 size={18} className="animate-spin text-primary" />
        ) : downloaded ? (
          <CheckCircle2 size={18} className="text-emerald-500" />
        ) : (
          <Download size={18} />
        )}
      </button>
    </div>
  );
};

export default PdfDownloadCard;
