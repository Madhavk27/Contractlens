import React, { useState, useRef, useEffect } from 'react';
import { AnimatedLogo } from './AnimatedLogo';
import { NavigationTab } from '../types';
import { Bell, Sparkles, UploadCloud, LogIn, LogOut, CheckCircle2, AlertTriangle, ShieldCheck, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopNavigationProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenAskAi: () => void;
  onOpenUpload: () => void;
  notificationsCount?: number;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  currentTab,
  onSelectTab,
  onOpenAskAi,
  onOpenUpload,
  notificationsCount = 3,
}) => {
  const { user, email, displayName, photoURL, emailVerified, openAuthModal, logout, resendVerificationEmail } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleResend = async () => {
    setResendStatus('sending');
    const ok = await resendVerificationEmail();
    if (ok) {
      setResendStatus('sent');
      setTimeout(() => setResendStatus('idle'), 4000);
    } else {
      setResendStatus('idle');
    }
  };

  const getInitials = () => {
    if (displayName) {
      const parts = displayName.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return displayName.slice(0, 2).toUpperCase();
    }
    if (email) return email.slice(0, 2).toUpperCase();
    return 'CL';
  };
  return (
    <header className="sticky top-0 z-30 w-full bg-[#07080F]/90 backdrop-blur-xl border-b border-violet-950/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <button
            onClick={() => onSelectTab('contracts')}
            className="flex items-center text-left focus:outline-none group"
            title="ContractLens Workspace"
          >
            <AnimatedLogo size="md" showWordmark={true} />
          </button>
        </div>

        {/* Center: Futuristic Navigation with Glow & Underline */}
        <nav className="flex items-center gap-8 h-full">
          <button
            onClick={() => onSelectTab('contracts')}
            className={`h-full flex items-center text-sm font-medium transition-all relative ${
              currentTab === 'contracts'
                ? 'text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-violet-500 after:via-indigo-500 after:to-cyan-400 after:shadow-[0_0_10px_#22D3EE]'
                : 'text-slate-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
            }`}
          >
            Contracts
          </button>

          <button
            onClick={() => onSelectTab('actions')}
            className={`h-full flex items-center text-sm font-medium transition-all relative ${
              currentTab === 'actions'
                ? 'text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-violet-500 after:via-indigo-500 after:to-cyan-400 after:shadow-[0_0_10px_#22D3EE]'
                : 'text-slate-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
            }`}
          >
            Actions
            <span className="ml-2 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/40 shadow-[0_0_8px_rgba(244,63,94,0.3)]">
              3
            </span>
          </button>

          <button
            onClick={() => onSelectTab('compare')}
            className={`h-full flex items-center text-sm font-medium transition-all relative ${
              currentTab === 'compare'
                ? 'text-white drop-shadow-[0_0_10px_rgba(139,92,246,0.5)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-gradient-to-r after:from-violet-500 after:via-indigo-500 after:to-cyan-400 after:shadow-[0_0_10px_#22D3EE]'
                : 'text-slate-400 hover:text-cyan-300 hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]'
            }`}
          >
            Compare
          </button>
        </nav>

        {/* Right: Ask ContractLens CTA, Notifications, Profile */}
        <div className="flex items-center gap-3.5">
          {/* Ask ContractLens Gradient CTA */}
          <button
            onClick={onOpenAskAi}
            className="relative group p-[1px] rounded-full overflow-hidden transition-all focus:outline-none"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 rounded-full animate-pulse opacity-70 group-hover:opacity-100 transition-opacity" />
            <div className="relative px-3.5 py-1.5 rounded-full bg-[#0D1122] flex items-center gap-2 text-xs font-semibold text-cyan-200 group-hover:text-white transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Ask ContractLens</span>
            </div>
          </button>

          <button
            onClick={onOpenUpload}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-[#0E1326] hover:bg-violet-950/40 rounded-full transition-all border border-violet-900/40 hover:border-violet-600/60"
          >
            <UploadCloud className="w-3.5 h-3.5 text-violet-400" />
            <span>Upload</span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              className="p-2 text-slate-400 hover:text-cyan-300 hover:bg-[#0E1326] rounded-full transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {notificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_6px_#F43F5E]" />
              )}
            </button>
          </div>

          {/* User Profile / Auth State */}
          <div className="flex items-center pl-2 border-l border-violet-950/60 relative" ref={menuRef}>
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white text-xs font-bold flex items-center justify-center cursor-pointer shadow-[0_0_12px_rgba(139,92,246,0.4)] border border-violet-400/40 hover:scale-105 transition-transform overflow-hidden"
                  title={displayName || email || 'User Profile'}
                >
                  {photoURL ? (
                    <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    getInitials()
                  )}
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-3 w-64 rounded-2xl bg-[#0D1122] border border-violet-900/60 shadow-[0_10px_35px_rgba(0,0,0,0.6)] p-4 z-50 animate-in fade-in zoom-in-95">
                    {/* User Info */}
                    <div className="flex items-center gap-3 pb-3 border-b border-violet-950/80">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-bold flex items-center justify-center text-sm shadow-[0_0_10px_rgba(139,92,246,0.3)] shrink-0 overflow-hidden">
                        {photoURL ? (
                          <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          getInitials()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">
                          {displayName || 'ContractLens User'}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {email}
                        </div>
                      </div>
                    </div>

                    {/* Verification Status */}
                    <div className="py-2.5 border-b border-violet-950/80">
                      {emailVerified ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Verified Identity</span>
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Email not verified</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleResend}
                            disabled={resendStatus === 'sending'}
                            className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 block cursor-pointer"
                          >
                            {resendStatus === 'sending'
                              ? 'Sending...'
                              : resendStatus === 'sent'
                              ? 'Verification sent!'
                              : 'Resend verification email'}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Quick Security Status */}
                    <div className="py-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>Zero-Trust RBAC Active</span>
                    </div>

                    {/* Sign Out Button */}
                    <button
                      type="button"
                      onClick={async () => {
                        setIsProfileMenuOpen(false);
                        await logout();
                      }}
                      className="w-full mt-2 py-2 px-3 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-full bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-xs font-bold text-cyan-300 hover:text-white transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(139,92,246,0.3)] cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-cyan-400" />
                  <span>SIGN IN</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
