import React, { useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, Download, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { convertService } from '../services/api';

interface ImageToPdfPageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const ImageToPdfPage: React.FC<ImageToPdfPageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      const newFiles = [...files, ...selected];
      setFiles(newFiles);

      const newPreviews = selected.map(f => URL.createObjectURL(f));
      setPreviews([...previews, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setConverting(true);
    setProgress(0);
    setError(null);
    try {
      const res = await convertService.imageToPdf(files, (pct) => setProgress(pct));
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to convert images to PDF.');
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
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/20 flex-shrink-0">
            <ImageIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Image to PDF Converter</h1>
            <p className="text-xs sm:text-sm text-slate-400">Convert JPG, PNG, and WEBP images into an organized PDF document.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs sm:text-sm border border-rose-500/30 font-medium">
            {error}
          </div>
        )}

        {/* Upload Box */}
        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-2xl p-6 sm:p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
                id="image-upload" 
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base">Tap to select images or drag and drop</span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP, and HEIC up to 50MB</span>
              </label>
            </div>

            {/* Selected Images Grid */}
            {files.length > 0 && (
              <div className="mt-6 sm:mt-8">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Selected Images ({files.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-white/10 aspect-[3/4] bg-slate-950 shadow-sm">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-white hover:bg-rose-600 transition-colors"
                        aria-label="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/70 text-white text-[10px] font-bold">
                        Page {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    {converting ? `Converting (${progress}%)...` : `Generate PDF (${files.length} pages)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Result View */
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Your PDF is Ready!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">Converted {files.length} images into <strong>{result.filename}</strong></p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download PDF File
              </a>
              <button
                onClick={() => { setResult(null); setFiles([]); setPreviews([]); }}
                className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-slate-300 hover:bg-white/5 transition-colors text-sm"
              >
                Convert More Images
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
