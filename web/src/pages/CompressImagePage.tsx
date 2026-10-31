import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, ArrowLeft, TrendingDown } from 'lucide-react';
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

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Tools
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Compress Image (JPG, PNG, WEBP)</h1>
            <p className="text-sm text-slate-500">Reduce image size dramatically with smart quality retention.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFile}
                className="hidden" 
                id="img-compress-upload" 
              />
              <label htmlFor="img-compress-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-base">
                  {file ? file.name : 'Select Image to Compress'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP</span>
              </label>
            </div>

            {file && preview && (
              <div className="mt-6">
                <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 mb-6">
                  <img src={preview} alt="preview" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{file.name}</h4>
                    <span className="text-xs text-slate-500">{formatSize(file.size)}</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mb-2">
                    <span>Quality Level: {quality}%</span>
                    <span className="text-xs text-slate-400 font-normal">Recommended: 65% - 80%</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="95"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleCompress}
                  disabled={compressing}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {compressing ? 'Compressing Image...' : 'Compress Image Now'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <TrendingDown className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Image Successfully Compressed!</h2>

            <div className="mt-5 inline-flex items-center gap-6 px-6 py-3 rounded-2xl bg-blue-50 border border-blue-200">
              <div>
                <span className="block text-xs font-semibold text-blue-700">Original</span>
                <span className="text-base font-bold text-slate-800">{formatSize(result.stats.initial_size)}</span>
              </div>
              <div className="text-xl font-black text-blue-600">→</div>
              <div>
                <span className="block text-xs font-semibold text-blue-700">Compressed</span>
                <span className="text-base font-bold text-slate-800">{formatSize(result.stats.final_size)}</span>
              </div>
              <div className="pl-4 border-l border-blue-200">
                <span className="block text-xs font-semibold text-blue-700">Saved</span>
                <span className="text-lg font-black text-blue-600">-{result.stats.saved_percentage}%</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-lg shadow-blue-500/25 transition-all"
              >
                <Download className="w-5 h-5" /> Download Compressed Image
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
