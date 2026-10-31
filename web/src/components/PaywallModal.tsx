import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Share2, Lightbulb, Star, Coins, ArrowRight, ShieldCheck, Copy } from 'lucide-react';
import { tokenService, TaskItem, UserProfile, authService } from '../services/api';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedUser: UserProfile) => void;
  onOpenAuth?: () => void;
  triggerReason?: string;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenAuth,
  triggerReason
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [balance, setBalance] = useState<number>(7);
  const [loadingTaskId, setLoadingTaskId] = useState<string | null>(null);
  const [claimedIds, setClaimedIds] = useState<Record<string, boolean>>({});
  const [activeTip, setActiveTip] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [selectedStars, setSelectedStars] = useState<number>(5);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTokenStatus = async () => {
    try {
      const data = await tokenService.getStatus();
      setBalance(data.tokens_balance);
      setTasks(data.tasks);
      const claimedMap: Record<string, boolean> = {};
      data.tasks.forEach(t => {
        if (t.is_claimed) claimedMap[t.id] = true;
      });
      setClaimedIds(claimedMap);
    } catch {
      const cached = authService.getCurrentCachedUser();
      if (cached?.tokens_balance !== undefined) {
        setBalance(cached.tokens_balance);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTokenStatus();
      setSuccessMessage(null);
      setErrorMessage(null);
      setCopiedLink(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = async (taskId: string) => {
    setLoadingTaskId(taskId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await tokenService.claimTask(taskId);
      setBalance(res.tokens_balance);
      setClaimedIds(prev => ({ ...prev, [taskId]: true }));
      setSuccessMessage(`🎉 ${res.message || `+${res.tokens_earned} Tokens successfully added!`}`);

      const userToSave = res.user || authService.getCurrentCachedUser() || {
        id: 0,
        email: 'guest@pdfsuite.local',
        role: 'USER',
        tokens_balance: res.tokens_balance,
        is_premium: false
      };
      userToSave.tokens_balance = res.tokens_balance;
      localStorage.setItem('pdf_suite_user', JSON.stringify(userToSave));
      if (onSuccess) onSuccess(userToSave);
    } catch (err: any) {
      const detail = err.response?.data?.detail;
      const errorMsg = typeof detail === 'string' ? detail : (detail?.message || 'Could not claim task. Please try again.');
      setErrorMessage(errorMsg);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const handleCopyAndShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
      handleClaim('share_app');
    } catch {
      handleClaim('share_app');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="relative bg-slate-900/95 border border-amber-500/25 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.25)] max-w-xl w-full overflow-hidden text-white backdrop-blur-2xl">
        {/* Glow ambient background orbs */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 border-b border-white/10 relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              100% Free & Open-Source
            </div>
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              Earn Free Conversion Tokens
              <span className="text-xs px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" /> {balance} Tokens Available
              </span>
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {triggerReason || "Complete quick, simple tasks to earn conversion tokens. Zero payments required!"}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Alerts */}
        <div className="px-6 pt-4 relative z-10">
          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce-short">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs font-bold flex items-center gap-2">
              <X className="w-4 h-4 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Task Cards Container */}
        <div className="p-6 relative z-10 space-y-3.5 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {/* Task 1: Daily Login Reward */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-amber-500/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Daily Login Bonus</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    +3 Tokens
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">Claim 3 free conversion tokens every 24 hours just by logging in.</p>
              </div>
            </div>
            <button
              onClick={() => handleClaim('daily_checkin')}
              disabled={loadingTaskId === 'daily_checkin' || claimedIds['daily_checkin']}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                claimedIds['daily_checkin']
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                  : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-amber-500/25 hover:scale-105 active:scale-95'
              }`}
            >
              {claimedIds['daily_checkin'] ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Claimed ✓
                </>
              ) : loadingTaskId === 'daily_checkin' ? (
                'Claiming...'
              ) : (
                'Claim (+3)'
              )}
            </button>
          </div>

          {/* Task 2: 10-Second PDF Tip */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 transition-all flex flex-col justify-between gap-3 group">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">Read Security & Pro Tip</span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      +5 Tokens
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs mt-0.5">Read a 10-second document tip and instantly earn 5 tokens.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTip(!activeTip);
                  if (!claimedIds['read_tip']) handleClaim('read_tip');
                }}
                disabled={loadingTaskId === 'read_tip'}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5 flex-shrink-0"
              >
                {claimedIds['read_tip'] ? <Check className="w-3.5 h-3.5" /> : null}
                {activeTip ? 'Hide Tip' : 'Read Tip (+5)'}
              </button>
            </div>

            {/* Expandable Tip Box */}
            {activeTip && (
              <div className="mt-2 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 text-blue-200 text-xs leading-relaxed animate-fade-in">
                💡 <strong>Pro Tip:</strong> When uploading PDFs to official job or university portals, choosing <strong>Compress PDF (Balanced Mode)</strong> preserves crisp text clarity while cutting file size by up to 80%!
              </div>
            )}
          </div>

          {/* Task 3: Share App Link */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-emerald-500/20">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Share with Friends</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    +10 Tokens
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">Share PDF Suite with colleagues or WhatsApp groups and earn 10 tokens.</p>
              </div>
            </div>
            <button
              onClick={handleCopyAndShare}
              disabled={loadingTaskId === 'share_app'}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5 flex-shrink-0"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Share Link (+10)
                </>
              )}
            </button>
          </div>

          {/* Task 4: Quick 5-Star Rating & Feedback */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0 shadow-lg shadow-purple-500/20">
                <Star className="w-5 h-5 fill-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">Rating & Feedback</span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    +5 Tokens
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">Leave a 5-star rating to support open-source development.</p>
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStars(star)}
                      className="text-amber-400 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-4 h-4 ${star <= selectedStars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => handleClaim('rate_feedback')}
              disabled={loadingTaskId === 'rate_feedback' || claimedIds['rate_feedback']}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 flex-shrink-0 ${
                claimedIds['rate_feedback']
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 cursor-default'
                  : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20'
              }`}
            >
              {claimedIds['rate_feedback'] ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Thank You!
                </>
              ) : (
                'Submit (+5)'
              )}
            </button>
          </div>
        </div>

        {/* Footer info & Done button */}
        <div className="p-6 border-t border-white/10 bg-slate-950/40 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free & Open-Source</span>
            </div>
            {onOpenAuth && (
              <>
                <span className="text-slate-600">•</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
                >
                  Sign in with Email
                </button>
              </>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <span>Continue Converting</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
