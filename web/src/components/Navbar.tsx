import React, { useState } from 'react';
import { 
  FileText, 
  User as UserIcon, 
  Shield, 
  LogOut, 
  Coins, 
  Menu, 
  X, 
  Image as ImageIcon, 
  FileType, 
  Files, 
  Minimize2, 
  FileSpreadsheet, 
  FileArchive,
  Sparkles
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  const navTools = [
    { id: 'image-to-pdf', label: 'Image to PDF', icon: ImageIcon },
    { id: 'pdf-to-word', label: 'PDF to Word', icon: FileText },
    { id: 'word-to-pdf', label: 'Word to PDF', icon: FileType },
    { id: 'pdf-to-image', label: 'PDF to Image', icon: Files },
    { id: 'compress-pdf', label: 'Compress PDF', icon: Minimize2 },
    { id: 'compress-image', label: 'Compress Image', icon: FileSpreadsheet },
    { id: 'file-to-zip', label: 'File to ZIP', icon: FileArchive },
  ];

  const handleToolClick = (toolId: string) => {
    onNavigate(toolId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 sm:top-3 z-50 max-w-7xl mx-auto px-2 sm:px-4 w-full pt-[max(env(safe-area-inset-top),0.5rem)] sm:pt-0">
      <div className="backdrop-blur-2xl bg-slate-900/80 border border-white/10 rounded-2xl px-3 sm:px-5 h-14 sm:h-16 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
        {/* Brand Logo */}
        <div 
          onClick={() => { onNavigate('home'); setMobileMenuOpen(false); }} 
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-all">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-full w-full bg-rose-500"></span>
            </span>
          </div>
          <div>
            <span className="font-black text-base sm:text-xl tracking-tight text-white flex items-center gap-0.5">
              PDF<span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Suite</span>
            </span>
            <span className="text-[8px] sm:text-[9px] block -mt-1 font-bold text-slate-400 uppercase tracking-widest">
              Document Tools
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tools (Hidden on Mobile) */}
        <nav className="hidden xl:flex items-center gap-1 text-xs font-semibold text-slate-300">
          {navTools.slice(0, 6).map((tool) => (
            <button 
              key={tool.id}
              onClick={() => onNavigate(tool.id)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                currentPage === tool.id 
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' 
                  : 'hover:bg-white/5 hover:text-white'
              }`}
            >
              {tool.label}
            </button>
          ))}
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Tokens Badge */}
          {user ? (
            <button
              onClick={onOpenPaywall}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              title="Click to view & earn tokens"
            >
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 flex-shrink-0" />
              <span>{isSuperAdmin ? 'Admin ∞' : `${user.tokens_balance ?? 7} 🪙`}</span>
            </button>
          ) : (
            <button
              onClick={onOpenPaywall}
              className="inline-flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-all"
              title="Earn free tokens"
            >
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Free Tokens</span>
            </button>
          )}

          {/* Earn Tokens Button (Desktop only, mobile has it in drawer) */}
          {!isSuperAdmin && (
            <button
              onClick={onOpenPaywall}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25 hover:opacity-90 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>Earn ⚡</span>
            </button>
          )}

          {/* Admin Switcher */}
          {isSuperAdmin && (
            <button
              onClick={() => onNavigate(currentPage === 'admin' ? 'home' : 'admin')}
              className={`hidden sm:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 transition-all ${
                currentPage === 'admin' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{currentPage === 'admin' ? 'Tools' : 'Admin'}</span>
            </button>
          )}

          {/* Auth Button / Profile Avatar */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-white/10">
              <div 
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[11px] sm:text-xs shadow-sm flex-shrink-0"
                title={user.email || 'User'}
              >
                {user.email ? user.email.slice(0, 2).toUpperCase() : 'U'}
              </div>
              <button
                onClick={() => {
                  authService.logout();
                  window.location.reload();
                }}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-all"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Sign In</span>
            </button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors ml-0.5"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden mt-2 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/15 shadow-2xl animate-fade-in text-white">
          {/* Quick Actions Row */}
          <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10">
            {isSuperAdmin && (
              <button
                onClick={() => {
                  onNavigate(currentPage === 'admin' ? 'home' : 'admin');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{currentPage === 'admin' ? 'Tools View' : 'Admin Console'}</span>
              </button>
            )}
            <button
              onClick={() => {
                onOpenPaywall();
                setMobileMenuOpen(false);
              }}
              className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Earn Free Tokens ⚡</span>
            </button>
          </div>

          {/* All 7 Tools Grid in Mobile Menu */}
          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
            All Document Tools
          </p>
          <div className="grid grid-cols-2 gap-2">
            {navTools.map((tool) => {
              const Icon = tool.icon;
              const isActive = currentPage === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => handleToolClick(tool.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 border border-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span className="truncate">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
