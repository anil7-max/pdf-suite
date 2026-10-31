import React, { useState } from 'react';
import { UploadCloud, FileType, Download, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';
import { convertService } from '../services/api';

interface WordToPdfPageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const WordToPdfPage: React.FC<WordToPdfPageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setError(null);
    try {
      const res = await convertService.wordToPdf(file);
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to convert Word document to PDF.');
      }
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white mb-4 sm:mb-6 transition-colors p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="relative bg-slate-900/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-2xl">
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg">
            <FileType className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              Word (DOCX) to PDF
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Reverse Engine
              </span>
            </h1>
            <p className="text-xs text-slate-400">Convert Microsoft Word documents (.docx) into clean, printable PDF files.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-300 text-xs border border-red-500/30 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-emerald-500/60 rounded-2xl p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                accept=".docx,.doc,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="word-upload" 
              />
              <label htmlFor="word-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-white text-base">
                  {file ? file.name : 'Select Word document (.docx) to convert to PDF'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Preserves text formatting and page layout</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:opacity-95 text-white font-black text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4" />
                  {converting ? 'Converting to PDF...' : 'Convert to PDF'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-white">PDF Document Ready!</h2>
            <p className="text-xs text-slate-400 mt-1">
              Converted <strong>{result.filename}</strong> ({(result.file_size / 1024).toFixed(1)} KB)
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105"
              >
                <Download className="w-4 h-4" /> Download PDF File
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-white/10 font-bold text-xs text-slate-300 hover:bg-white/5 transition-colors"
              >
                Convert Another Document
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
