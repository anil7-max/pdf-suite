import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, ArrowLeft, CheckCircle2, TrendingDown, Sliders } from 'lucide-react';
import { convertService } from '../services/api';

interface CompressImagePageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const CompressImagePage: React.FC<CompressImagePageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(70);
  const [compressing, setCompressing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
      setResult(null);
      setError(null);
    }
  };

  const handleCompress = async () => {
    if (!file) return;
    setCompressing(true);
    setError(null);
    try {
      const res = await convertService.compressImage(file, quality);
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to compress image.');
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
    <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white mb-4 sm:mb-6 transition-colors p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20 flex-shrink-0">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Compress Image (JPG, PNG, WEBP)</h1>
            <p className="text-xs sm:text-sm text-slate-400">Reduce image size dramatically with smart quality retention.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs sm:text-sm border border-rose-500/30 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-cyan-500/50 rounded-2xl p-6 sm:p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
                id="image-compress-upload" 
              />
              <label htmlFor="image-compress-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base max-w-xs truncate">
                  {file ? file.name : 'Tap to select an image'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP up to 50MB</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                {preview && (
                  <div className="mb-6 flex justify-center">
                    <img 
                      src={preview} 
                      alt="Selected" 
                      className="max-h-48 sm:max-h-60 rounded-xl object-contain border border-white/10 shadow-lg"
                    />
                  </div>
                )}

                <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" /> Compression Quality:
                    </span>
                    <span className="text-xs font-extrabold text-cyan-400 px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30">
                      {quality}%
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="20" 
                    max="95" 
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-cyan-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                    <span>Smallest File (20%)</span>
                    <span>Balanced (70%)</span>
                    <span>Best Quality (95%)</span>
                  </div>
                </div>

                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {compressing ? 'Compressing Image...' : 'Compress Image Now'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingDown className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Image Compressed!</h2>
            
            {/* Stats */}
            <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-4 sm:px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-center">
              <div>
                <span className="block text-[11px] font-semibold text-slate-400">Original</span>
                <span className="text-sm sm:text-base font-bold text-white">{formatSize(result.stats.initial_size)}</span>
              </div>
              <div className="text-lg font-black text-cyan-400">→</div>
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
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-sm sm:text-base shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download Compressed Image
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); setPreview(null); }}
                className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-slate-300 hover:bg-white/5 transition-colors text-sm"
              >
                Compress Another Image
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
