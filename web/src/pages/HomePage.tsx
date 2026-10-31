import React from 'react';
import { 
  Image, 
  FileArchive, 
  Minimize2, 
  Files, 
  FileSpreadsheet, 
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  Smartphone,
  FileText,
  FileType,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';
import { UserProfile } from '../services/api';

interface HomePageProps {
  user: UserProfile | null;
  onNavigate: (page: string) => void;
  onOpenPaywall: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ user, onNavigate, onOpenPaywall }) => {
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isPremium = user?.is_premium || isSuperAdmin;

  const tools = [
    {
      id: 'image-to-pdf',
      title: 'Image to PDF',
      desc: 'Combine multiple JPG, PNG, WEBP pictures into an organized PDF with custom margins and reordering.',
      icon: Image,
      color: 'from-rose-500 to-pink-600',
      glow: 'shadow-rose-500/20 group-hover:border-rose-500/50',
      badge: 'Popular'
    },
    {
      id: 'pdf-to-word',
      title: 'PDF to Word (DOCX)',
      desc: 'Convert read-only PDF files into editable Microsoft Word (.docx) documents with layout preservation.',
      icon: FileText,
      color: 'from-blue-500 to-indigo-600',
      glow: 'shadow-blue-500/20 group-hover:border-blue-500/50',
      badge: 'Editable'
    },
    {
      id: 'word-to-pdf',
      title: 'Word to PDF',
      desc: 'Convert DOCX Word documents and text files into clean, standardized printable PDF documents.',
      icon: FileType,
      color: 'from-teal-500 to-emerald-600',
      glow: 'shadow-emerald-500/20 group-hover:border-emerald-500/50',
      badge: 'Reverse'
    },
    {
      id: 'pdf-to-image',
      title: 'PDF to Image',
      desc: 'Extract every PDF page into crystal-clear 300 DPI JPG images packed automatically in a ZIP archive.',
      icon: Files,
      color: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20 group-hover:border-amber-500/50',
      badge: 'High-Res'
    },
    {
      id: 'compress-pdf',
      title: 'Compress PDF',
      desc: 'Reduce file size up to 90% using intelligent stream deflating and embedded image downsampling.',
      icon: Minimize2,
      color: 'from-emerald-500 to-teal-600',
      glow: 'shadow-teal-500/20 group-hover:border-teal-500/50',
      badge: '-90% Cut'
    },
    {
      id: 'compress-image',
      title: 'Compress Image',
      desc: 'Lossy & lossless image compression for JPG, PNG, and WEBP files with interactive visual slider.',
      icon: FileSpreadsheet,
      color: 'from-cyan-500 to-blue-600',
      glow: 'shadow-cyan-500/20 group-hover:border-cyan-500/50',
      badge: 'Lossless'
    },
    {
      id: 'file-to-zip',
      title: 'File to ZIP Archive',
      desc: 'Pack any mixture of documents, spreadsheets, videos, and folders into a fast, compressed ZIP file.',
      icon: FileArchive,
      color: 'from-purple-500 to-violet-600',
      glow: 'shadow-purple-500/20 group-hover:border-purple-500/50',
      badge: 'Archiver'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 relative">
      {/* Main Container */}
      <div className="relative rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden p-6 sm:p-10">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 pt-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-semibold text-slate-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Professional Document & PDF Utilities
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Every Document Tool, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-400">
              Fast, Private & Simple
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            Convert, compress, extract, and archive PDFs, Word documents, images, and ZIP files with enterprise-grade quality.
          </p>

          {/* Token Indicator Banner */}
          <div className="mt-6 inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg backdrop-blur-xl text-xs">
            {isSuperAdmin ? (
              <span className="text-amber-300 font-extrabold flex items-center gap-1.5">
                👑 Super Admin Console (Unlimited Conversions)
              </span>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2 text-slate-300 font-medium">
                <span>🪙 Available Balance: <strong className="text-amber-400 font-bold">{user?.tokens_balance ?? 7} Conversion Tokens</strong></span>
                <span className="text-slate-500">•</span>
                <span className="text-emerald-400 font-semibold">100% Free & Open-Source</span>
                <button 
                  onClick={onOpenPaywall}
                  className="text-amber-300 font-black hover:text-amber-200 ml-2 inline-flex items-center gap-1 bg-amber-500/20 border border-amber-500/30 px-3 py-1 rounded-xl transition-all"
                >
                  Earn Free Tokens ⚡ →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Grid of Tools with Cinematic Glow Borders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={() => onNavigate(tool.id)}
                className={`group relative bg-slate-900/60 rounded-3xl p-6 border border-white/10 transition-all duration-300 cursor-pointer hover:-translate-y-1.5 hover:shadow-2xl ${tool.glow} overflow-hidden backdrop-blur-xl`}
              >
                {/* Ambient glow inside card */}
                <div className="absolute -top-12 -right-12 w-28 h-28 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />

                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tool.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  {tool.badge && (
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 group-hover:text-white transition-colors">
                      {tool.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-extrabold text-white group-hover:text-rose-400 transition-colors flex items-center justify-between">
                  {tool.title}
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all" />
                </h3>

                <p className="mt-2 text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {tool.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Cinematic System Highlights */}
        <div className="mt-16 pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Automatic 2-Hour Purge</h4>
            <p className="mt-1.5 text-xs text-slate-400">
              Files are automatically and permanently deleted 2 hours after conversion for guaranteed zero-leak privacy.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Instant Asynchronous Engine</h4>
            <p className="mt-1.5 text-xs text-slate-400">
              C-level Ghostscript, Poppler, and PyMuPDF bindings process heavy files without blocking or lag.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">100% Native Mobile Apps</h4>
            <p className="mt-1.5 text-xs text-slate-400">
              Native Kotlin Compose for Android and Swift SwiftUI for iOS with full Google Play & StoreKit billing.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
