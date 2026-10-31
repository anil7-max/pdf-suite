import React, { useState } from 'react';
import { UploadCloud, FileArchive, Download, ArrowLeft, CheckCircle2, File, X } from 'lucide-react';
import { convertService } from '../services/api';

interface FileToZipPageProps {
  onBack: () => void;
  onOpenPaywall: (msg?: string) => void;
  onQuotaUsed: () => void;
}

export const FileToZipPage: React.FC<FileToZipPageProps> = ({ onBack, onOpenPaywall, onQuotaUsed }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [zipping, setZipping] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleZip = async () => {
    if (files.length === 0) return;
    setZipping(true);
    setError(null);
    try {
      const res = await convertService.fileToZip(files);
      setResult(res);
      onQuotaUsed();
    } catch (err: any) {
      if (err.response?.status === 402 || err.response?.data?.detail?.code === 'PREMIUM_REQUIRED') {
        onOpenPaywall(err.response?.data?.detail?.message);
      } else {
        setError(err.response?.data?.detail || 'Failed to generate ZIP archive.');
      }
    } finally {
      setZipping(false);
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
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <FileArchive className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900">File to ZIP Archive</h1>
            <p className="text-sm text-slate-500">Compress and bundle multiple files into a single ZIP file.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-sm border border-red-200 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-2xl p-10 text-center transition-colors bg-slate-50/50">
              <input 
                type="file" 
                multiple
                onChange={handleFiles}
                className="hidden" 
                id="zip-upload" 
              />
              <label htmlFor="zip-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="font-bold text-slate-800 text-base">
                  Select files or drag and drop to ZIP
                </span>
                <span className="text-xs text-slate-400 mt-1">Supports any file type (PDF, Images, DOC, XLSX, etc.)</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">
                  Files to Archive ({files.length}):
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2 mb-6 pr-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <File className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <span className="font-medium text-slate-800 truncate">{f.name}</span>
                        <span className="text-xs text-slate-400 flex-shrink-0">({formatSize(f.size)})</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleZip}
                  disabled={zipping}
                  className="w-full py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all"
                >
                  {zipping ? 'Compressing Files into ZIP...' : `Create ZIP (${files.length} Files)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">ZIP Archive Created!</h2>
            <p className="text-sm text-slate-500 mt-1">
              Archived <strong>{result.file_count} files</strong> ({formatSize(result.file_size)})
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-lg shadow-purple-500/25 transition-all"
              >
                <Download className="w-5 h-5" /> Download ZIP Archive
              </a>
              <button
                onClick={() => { setResult(null); setFiles([]); }}
                className="px-6 py-3.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Create Another ZIP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
