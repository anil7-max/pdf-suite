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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to All Tools
      </button>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Files className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">PDF to Image (JPG/PNG)</h1>
            <p className="text-sm text-slate-500">Extract every page of your PDF into high-resolution JPG images.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50">
              <input 
                type="file" 
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden" 
                id="pdf-upload" 
              />
              <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-base">
                  {file ? file.name : 'Select PDF file or drag and drop here'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Up to 25MB for free tier</span>
              </label>
            </div>

            {file && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700">Resolution / Quality:</span>
                  <div className="flex gap-2">
                    {[100, 150, 300].map((v) => (
                      <button
                        key={v}
                        onClick={() => setDpi(v)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          dpi === v ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {v} DPI {v === 300 ? '(Pro)' : ''}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={converting}
                  className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {converting ? 'Extracting Pages into Images...' : 'Convert to Images (ZIP)'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Images Extracted!</h2>
            <p className="text-sm text-slate-500 mt-1">Extracted <strong>{result.page_count} pages</strong> into a ZIP archive.</p>

            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-base shadow-lg shadow-amber-500/25 transition-all"
              >
                <Download className="w-5 h-5" /> Download Images ZIP
              </a>
              <button
                onClick={() => { setResult(null); setFile(null); }}
                className="px-6 py-3.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
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
