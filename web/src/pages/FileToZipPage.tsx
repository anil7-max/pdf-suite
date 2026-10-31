import React, { useState } from 'react';
import { UploadCloud, FileArchive, X, Download, ArrowLeft, CheckCircle2, File } from 'lucide-react';
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setFiles([...files, ...selected]);
      setResult(null);
      setError(null);
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
    <div className="max-w-4xl mx-auto px-2.5 sm:px-4 py-4 sm:py-8">
      <button 
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-400 hover:text-white mb-4 sm:mb-6 transition-colors p-1"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Tools
      </button>

      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 border border-white/10 shadow-2xl text-white">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <FileArchive className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">File to ZIP Archive</h1>
            <p className="text-xs sm:text-sm text-slate-400">Compress and bundle any files into a single ZIP file.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 text-rose-300 text-xs sm:text-sm border border-rose-500/30 font-medium">
            {error}
          </div>
        )}

        {!result ? (
          <div>
            <div className="border-2 border-dashed border-white/15 hover:border-purple-500/50 rounded-2xl p-6 sm:p-10 text-center transition-all bg-white/[0.02]">
              <input 
                type="file" 
                multiple
                onChange={handleFileChange}
                className="hidden" 
                id="zip-upload" 
              />
              <label htmlFor="zip-upload" className="cursor-pointer flex flex-col items-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-purple-500/15 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <span className="font-bold text-white text-sm sm:text-base">Tap to select files to archive</span>
                <span className="text-[11px] sm:text-xs text-slate-400 mt-1">Select documents, images, videos or any files</span>
              </label>
            </div>

            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Files to Archive ({files.length})
                </h3>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-xs">
                      <div className="flex items-center gap-2 max-w-[80%] truncate">
                        <File className="w-4 h-4 text-purple-400 flex-shrink-0" />
                        <span className="text-slate-200 font-medium truncate">{f.name}</span>
                        <span className="text-slate-500 font-mono text-[10px]">({formatSize(f.size)})</span>
                      </div>
                      <button
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                        aria-label="Remove file"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleZip}
                  disabled={zipping}
                  className="w-full mt-6 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {zipping ? 'Creating ZIP Archive...' : `Pack into ZIP (${files.length} files)`}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-9 sm:h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">ZIP Archive Ready!</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Packed <strong>{result.file_count} files</strong> into <strong>{result.filename}</strong> ({formatSize(result.total_size)})
            </p>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
              <a
                href={convertService.getDownloadUrl(result.filename)}
                download
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-500 to-violet-600 hover:opacity-90 text-white font-bold text-sm sm:text-base shadow-lg shadow-purple-500/25 transition-all"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" /> Download ZIP Archive
              </a>
              <button
                onClick={() => { setResult(null); setFiles([]); }}
                className="px-6 py-3.5 rounded-xl border border-white/15 font-bold text-slate-300 hover:bg-white/5 transition-colors text-sm"
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
