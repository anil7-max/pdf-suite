import React from 'react';
import { FileText, Crown, User as UserIcon, Shield, LogOut, Sparkles, Coins } from 'lucide-react';
import { UserProfile, authService } from '../services/api';

interface NavbarProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onOpenPaywall: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onOpenAuth,
  onOpenPaywall,
  onNavigate,
  currentPage,
}) => {
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isPremium = user?.is_premium || isSuperAdmin;

  return (
    <header className="sticky top-4 z-40 max-w-7xl mx-auto px-4 w-full">
      <div className="backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-2xl px-5 h-16 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Brand Logo */}
        <div 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-all">
              <FileText className="w-5 h-5" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          </div>
          <div>
            <span className="font-black text-xl tracking-tight text-white flex items-center gap-0.5">
              PDF<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Suite</span>
            </span>
            <span className="text-[9px] block -mt-1 font-bold text-slate-400 uppercase tracking-widest">
              Document Tools
            </span>
          </div>
        </div>

        {/* Navigation Tools */}
        <nav className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
          <button 
            onClick={() => onNavigate('image-to-pdf')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'image-to-pdf' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            Image to PDF
          </button>
          <button 
            onClick={() => onNavigate('pdf-to-word')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'pdf-to-word' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            PDF to Word
          </button>
          <button 
            onClick={() => onNavigate('pdf-to-image')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'pdf-to-image' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            PDF to Image
          </button>
          <button 
            onClick={() => onNavigate('compress-pdf')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'compress-pdf' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            Compress PDF
          </button>
          <button 
            onClick={() => onNavigate('compress-image')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'compress-image' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            Compress Image
          </button>
          <button 
            onClick={() => onNavigate('file-to-zip')}
            className={`px-3 py-1.5 rounded-xl transition-all ${currentPage === 'file-to-zip' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'hover:bg-white/5 hover:text-white'}`}
          >
            File to ZIP
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-3">
          {/* Quota or Tokens badge */}
          {user && (
            <div className="hidden sm:flex items-center">
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Shield className="w-3.5 h-3.5 text-indigo-400" /> Admin (Unlimited)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user.tokens_balance ?? user.quota?.remaining_today ?? 7} Tokens</span>
                </span>
              )}
            </div>
          )}

          {/* Earn Tokens Reward Button (Replaces paid upgrade button) */}
          {!isSuperAdmin && (
            <button
              onClick={onOpenPaywall}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/25 hover:opacity-90 transition-all hover:scale-105"
              title="Complete quick tasks to earn free tokens"
            >
              <Coins className="w-3.5 h-3.5 text-amber-200" />
              <span>Earn Tokens ⚡</span>
            </button>
          )}

          {/* Admin link if Super Admin */}
          {isSuperAdmin && (
            <button
              onClick={() => onNavigate(currentPage === 'admin' ? 'home' : 'admin')}
              className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                currentPage === 'admin' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
              }`}
              title="Super Admin Dashboard"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-300" />
              <span>{currentPage === 'admin' ? 'Tools View' : 'Admin Console'}</span>
            </button>
          )}

          {/* User Profile / Login */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div 
                className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm"
                title={user.email || 'User'}
              >
                {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <button
                onClick={() => {
                  authService.logout();
                  window.location.reload();
                }}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5" />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
