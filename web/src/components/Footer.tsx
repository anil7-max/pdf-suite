import React from 'react';
import { ShieldCheck, Zap, Lock, Smartphone, Globe, LogIn, FileText, ArrowRight } from 'lucide-react';
import { UserProfile } from '../services/api';

interface FooterProps {
  onNavigate?: (page: string) => void;
  onOpenAuth?: () => void;
  user?: UserProfile | null;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuth, user }) => {
  return (
    <footer className="relative z-10 border-t border-slate-800 bg-slate-950/90 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div>
            <span className="font-black text-xl text-white tracking-tight flex items-center gap-1">
              PDF<span className="text-rose-500">Suite</span>
            </span>
            <p className="mt-3 text-xs text-slate-400 leading-relaxed">
              Fast, private, and secure document processing suite. 100% free & open-source with automatic 2-hour server wipes for maximum confidentiality.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero Privacy Leak Guarantee</span>
            </div>
          </div>

          {/* Tools Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Popular Document Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('image-to-pdf')}
                  className="hover:text-rose-400 transition-colors text-left"
                >
                  Image to PDF Converter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('pdf-to-word')}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  PDF to Word (DOCX)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('word-to-pdf')}
                  className="hover:text-teal-400 transition-colors text-left"
                >
                  Word to PDF Converter
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('compress-pdf')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Compress PDF (-90% Size)
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onNavigate && onNavigate('file-to-zip')}
                  className="hover:text-purple-400 transition-colors text-left"
                >
                  File to ZIP Archive
                </button>
              </li>
            </ul>
          </div>

          {/* Privacy & Security */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Privacy & Security</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>256-bit SSL / HTTPS encrypted</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>In-memory high-speed conversion</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>2-Hour auto-deletion of all files</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-rose-400" />
                <span>No third-party tracking</span>
              </li>
            </ul>
          </div>

          {/* Cross-Platform Ecosystem & Account */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Multi-Platform Ecosystem</h4>
            <ul className="space-y-2.5 text-xs text-slate-400 mb-4">
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-rose-400" />
                <span>Native Android (Kotlin + Compose)</span>
              </li>
              <li className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Native iOS (Swift + SwiftUI)</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Web Application (React + Vite)</span>
              </li>
            </ul>

            {!user ? (
              <button
                onClick={() => onOpenAuth && onOpenAuth()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign In to Your Account</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-500 font-mono">
                Signed in as: {user.email}
              </span>
            )}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© 2026 PDF Suite Multi-Platform Ecosystem. 100% Free & Open-Source.</div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              className="hover:text-slate-300 transition-colors"
            >
              All Tools
            </button>
            <span>•</span>
            {user?.role === 'SUPER_ADMIN' && (
              <>
                <button 
                  onClick={() => onNavigate && onNavigate('admin')}
                  className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
                >
                  Admin Console
                </button>
                <span>•</span>
              </>
            )}
            <span>Token Economy (No Paywall)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
