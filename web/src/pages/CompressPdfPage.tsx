import React, { useState } from 'react';
import { UploadCloud, Minimize2, Download, ArrowLeft, TrendingDown } from 'lucide-react';
import { convertService } from '../services/api';

interface CompressPdfPageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const CompressPdfPage: React.FC<CompressPdfPageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'extreme' | 'recommended' | 'low'>('recommended');
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompress = async () => {
    if (!file) return;
    setCompressing(true);
    setError(null);
    try {
      const res = await convertService.compressPdf(file, level);
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to compress PDF file.');
      }
    } finally {
      setCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white mb-4 sm:mb-6 transition-colors p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Compress PDF File</h1>
            <p className="text-xs sm:text-sm text-slate-400">Shrink PDF file size while retaining crystal clear visual quality.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs sm:text-sm border border-rose-500/30 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-emerald-500/50 rounded-2xl p-6 sm:p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="compress-upload" 
              />
              <label htmlFor="compress-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base max-w-xs truncate">
                  {file ? file.name : 'Tap to select PDF to compress'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-1">Smart compression algorithms reduce up to 80%</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">Select Compression Level:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-6">
                  <div 
                    onClick={() => setLevel('extreme')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      level === 'extreme' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">Extreme</div>
                    <div className="text-[11px] text-slate-400 mt-1">Lowest file size, downscaled images</div>
                  </div>

                  <div 
                    onClick={() => setLevel('recommended')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      level === 'recommended' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">Recommended</div>
                    <div className="text-[11px] text-slate-400 mt-1">Optimal size & high quality</div>
                  </div>

                  <div 
                    onClick={() => setLevel('low')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      level === 'low' ? 'border-emerald-500 bg-emerald-500/15' : 'border-white/10 hover:border-white/20 bg-white/[0.02]'
                    }`}
                  >
                    <div className="font-bold text-sm text-white">Low</div>
                    <div className="text-[11px] text-slate-400 mt-1">High quality, subtle reduction</div>
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {compressing ? 'Compressing PDF...' : 'Compress PDF Now'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">PDF Successfully Compressed!</h2>
            
            {/* Stats Badge */}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div>
                <span className="block text-[11px] font-semibold text-slate-400">Original</span>
                <span className="text-sm sm:text-base font-bold text-white">{formatSize(result.stats.initial_size)}</span>
              </div>
              <div className="text-lg font-black text-emerald-400">→</div>
              <div>
                <span className="block text-[11px] font-semibold text-slate-400">Compressed</span>
                <span className="text-sm sm:text-base font-bold text-white">{formatSize(result.stats.final_size)}</span>
              </div>
              <div className="pl-3 sm:pl-4 border-l border-white/10">
                <span className="block text-[11px] font-semibold text-emerald-400">Saved</span>
                <span className="text-base sm:text-lg font-black text-emerald-400">-{result.stats.saved_percentage}%</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download Compressed PDF
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-slate-300 hover:bg-white/5 transition-colors text-sm"
              >
                Compress Another PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
