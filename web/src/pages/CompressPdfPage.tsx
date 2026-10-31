import React, { useState } from 'react';
import { UploadCloud, Minimize2, Download, ArrowLeft, CheckCircle2, TrendingDown } from 'lucide-react';
import { convertService } from '../services/api';

interface CompressPdfPageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const CompressPdfPage: React.FC<CompressPdfPageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<'recommended' | 'extreme' | 'low'>('recommended');
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
        setError(err.response?.data?.detail || 'Failed to compress PDF.');
      }
    } finally {
      setCompressing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / 1024).toFixed(1) + ' KB';
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Tools
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Minimize2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Compress PDF File</h1>
            <p className="text-sm text-slate-500">Shrink PDF file size while retaining crystal clear visual quality.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="compress-upload" 
              />
              <label htmlFor="compress-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-base">
                  {file ? file.name : 'Select PDF to compress'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Smart compression algorithms reduce up to 80%</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Select Compression Level:</h3>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div 
                    onClick={() => setLevel('extreme')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      level === 'extreme' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">Extreme</div>
                    <div className="text-[11px] text-slate-500 mt-1">Lowest size, good quality</div>
                  </div>

                  <div 
                    onClick={() => setLevel('recommended')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      level === 'recommended' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">Recommended</div>
                    <div className="text-[11px] text-slate-500 mt-1">Optimal size & high quality</div>
                  </div>

                  <div 
                    onClick={() => setLevel('low')}
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                      level === 'low' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-sm text-slate-900">Low</div>
                    <div className="text-[11px] text-slate-500 mt-1">High quality, subtle reduction</div>
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {compressing ? 'Compressing PDF...' : 'Compress PDF Now'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingDown className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">PDF Successfully Compressed!</h2>
            
            {/* Stats Badge */}
            <div className="mt-5 inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-emerald-50 border border-emerald-200">
              <div>
                <span className="block text-xs font-semibold text-emerald-700">Original</span>
                <span className="text-base font-bold text-slate-800">{formatSize(result.stats.initial_size)}</span>
              </div>
              <div className="text-xl font-black text-emerald-600">→</div>
              <div>
                <span className="block text-xs font-semibold text-emerald-700">Compressed</span>
                <span className="text-base font-bold text-slate-800">{formatSize(result.stats.final_size)}</span>
              </div>
              <div className="pl-4 border-l border-emerald-200">
                <span className="block text-xs font-semibold text-emerald-700">Saved</span>
                <span className="text-lg font-black text-emerald-600">-{result.stats.saved_percentage}%</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Download className="w-5 h-5" /> Download Compressed PDF
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
