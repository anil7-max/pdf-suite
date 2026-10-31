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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Tools
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-brand-600 flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Image to PDF Converter</h1>
            <p className="text-sm text-slate-500">Convert JPG, PNG, and WEBP images into an organized PDF document.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}

        {/* Upload Box */}
        {!result ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50">
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={handleFileChange}
                className="hidden" 
                id="image-upload" 
              />
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-brand-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-base">Click to select images or drag and drop</span>
                <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG, WEBP, and HEIC up to 15MB</span>
              </label>
            </div>

            {/* Selected Images Grid */}
            {files.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Selected Images ({files.length})
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {previews.map((preview, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 aspect-[3/4] bg-slate-100 shadow-sm">
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeFile(idx)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <span className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold">
                        Page {idx + 1}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleConvert}
                    disabled={converting}
                    className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 flex items-center gap-2 transition-all"
                  >
                    {converting ? `Converting (${progress}%)...` : `Generate PDF (${files.length} pages)`}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Result View */
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Your PDF is Ready!</h2>
            <p className="text-sm text-slate-500 mt-1">Converted {files.length} images into <strong>{result.filename}</strong></p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-base shadow-lg shadow-brand-500/25 transition-all"
              >
                <Download className="w-5 h-5" /> Download PDF File
              </a>
              <button
                onClick={() => { setResult(null); setFiles([]); setPreviews([]); }}
                className="px-6 py-3.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
