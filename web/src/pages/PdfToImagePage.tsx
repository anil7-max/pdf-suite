import React, { useState } from 'react';
import { UploadCloud, Files, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { convertService } from '../services/api';

interface PdfToImagePageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const PdfToImagePage: React.FC<PdfToImagePageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [dpi, setDpi] = useState<number>(150);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true);
    setError(null);
    try {
      const res = await convertService.pdfToImage(file, dpi);
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to extract images from PDF.');
      }
    } finally {
      setConverting(false);
    }
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20 flex-shrink-0">
            <Files className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">PDF to Image (JPG/PNG)</h1>
            <p className="text-xs sm:text-sm text-slate-400">Extract every page of your PDF into high-resolution JPG images.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs sm:text-sm border border-rose-500/30 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-amber-500/50 rounded-2xl p-6 sm:p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="pdf-upload" 
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base max-w-xs truncate">
                  {file ? file.name : 'Tap to select PDF file'}
                </span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-1">Converts all pages to 300 DPI high-res JPGs</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Resolution Quality:</span>
                  <div className="flex gap-2">
                    {[100, 150, 300].map((v) => (
                      <button
                        key={v}
                        onClick={() => setDpi(v)}
                        className={`flex-1 sm:flex-initial px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          dpi === v ? 'bg-amber-500 text-white shadow-md' : 'bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10'
                        }`}
                      >
                        {v} DPI
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {converting ? 'Extracting Pages into Images...' : 'Convert to Images (ZIP)'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Images Extracted!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Extracted <strong>{result.page_count} pages</strong> into a ZIP archive.</p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download Images ZIP
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-slate-300 hover:bg-white/5 transition-colors text-sm"
              >
                Convert Another PDF
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
