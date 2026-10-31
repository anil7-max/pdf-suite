import React, { useEffect, useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PaywallModal } from './components/PaywallModal';
import { HomePage } from './pages/HomePage';
import { ImageToPdfPage } from './pages/ImageToPdfPage';
import { PdfToWordPage } from './pages/PdfToWordPage';
import { WordToPdfPage } from './pages/WordToPdfPage';
import { PdfToImagePage } from './pages/PdfToImagePage';
import { CompressPdfPage } from './pages/CompressPdfPage';
import { CompressImagePage } from './pages/CompressImagePage';
import { FileToZipPage } from './pages/FileToZipPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { authService, UserProfile } from './services/api';

export const App: React.FC = () => {
  const cachedUser = authService.getCurrentCachedUser();
  const [currentPage, setCurrentPage] = useState<string>(cachedUser?.role === 'SUPER_ADMIN' ? 'admin' : 'home');
  const [user, setUser] = useState<UserProfile | null>(cachedUser);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [paywallOpen, setPaywallOpen] = useState<boolean>(false);
  const [paywallTriggerMsg, setPaywallTriggerMsg] = useState<string | undefined>();

  const refreshUser = async () => {
    const profile = await authService.getMe();
    if (profile) {
      setUser(profile);
      if (profile.role === 'SUPER_ADMIN' && currentPage === 'home') {
        setCurrentPage('admin');
      }
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleOpenPaywall = (msg?: string) => {
    setPaywallTriggerMsg(msg);
    setPaywallOpen(true);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#070913] text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Cinematic Ambient Background Nebula Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[10%] left-[15%] w-[600px] h-[600px] rounded-full bg-rose-600/15 blur-[140px] animate-float-1" />
        <div className="absolute top-[35%] -right-[10%] w-[550px] h-[550px] rounded-full bg-indigo-600/15 blur-[150px] animate-float-2" />
        <div className="absolute -bottom-[10%] left-[30%] w-[650px] h-[650px] rounded-full bg-amber-500/10 blur-[160px] animate-pulse-glow" />
      </div>

      {/* Main Content Viewport */}
      <div className="relative z-10 flex flex-col flex-1">
        <Navbar
          user={user}
          currentPage={currentPage}
          onNavigate={setCurrentPage}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenPaywall={() => handleOpenPaywall()}
        />

        <main className="flex-1 pb-16">
          {currentPage === 'home' && (
            <HomePage
              user={user}
              onNavigate={setCurrentPage}
              onOpenPaywall={() => handleOpenPaywall()}
            />
          )}

          {currentPage === 'image-to-pdf' && (
            <ImageToPdfPage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'pdf-to-word' && (
            <PdfToWordPage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'word-to-pdf' && (
            <WordToPdfPage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'pdf-to-image' && (
            <PdfToImagePage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'compress-pdf' && (
            <CompressPdfPage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'compress-image' && (
            <CompressImagePage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'file-to-zip' && (
            <FileToZipPage
              onBack={() => setCurrentPage('home')}
              onOpenPaywall={handleOpenPaywall}
              onQuotaUsed={refreshUser}
            />
          )}

          {currentPage === 'admin' && (
            <AdminDashboardPage
              onBack={() => setCurrentPage('home')}
              currentUser={user}
            />
          )}
        </main>

        <Footer 
          onNavigate={setCurrentPage} 
          onOpenAuth={() => setAuthModalOpen(true)} 
          user={user} 
        />
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={(loggedUser) => {
          setUser(loggedUser);
          if (loggedUser.role === 'SUPER_ADMIN') {
            setCurrentPage('admin');
          }
          refreshUser();
        }}
      />

      <PaywallModal
        isOpen={paywallOpen}
        onClose={() => setPaywallOpen(false)}
        onSuccess={(updatedUser) => {
          setUser(updatedUser);
          refreshUser();
        }}
        onOpenAuth={() => {
          setPaywallOpen(false);
          setAuthModalOpen(true);
        }}
        triggerReason={paywallTriggerMsg}
      />
    </div>
  );
};

export default App;
