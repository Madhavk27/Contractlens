import React, { useState } from 'react';
import { useAuth, AuthModalView } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, CheckCircle2, AlertCircle, RefreshCw, LogOut, ArrowRight, X } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalView,
    closeAuthModal,
    openAuthModal,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resendVerificationEmail,
    refreshVerificationStatus,
    logout,
    authError,
    clearAuthError,
    email: userEmail,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    clearAuthError();

    try {
      if (authModalView === 'login') {
        await signInWithEmail(email, password);
      } else if (authModalView === 'register') {
        await signUpWithEmail(email, password, name);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    try {
      await signInWithGoogle();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendSuccess(false);
    const ok = await resendVerificationEmail();
    if (ok) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 6000);
    }
  };

  const handleRefreshVerification = async () => {
    setRefreshing(true);
    try {
      await refreshVerificationStatus();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D1122] border border-violet-900/50 rounded-2xl shadow-[0_0_50px_rgba(139,92,246,0.25)] overflow-hidden">
        {/* Glowing Top Accent */}
        <div className="h-1 w-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400" />

        {/* Close Button */}
        {authModalView !== 'verify-email' && (
          <button
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-7">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                {authModalView === 'login' && 'Sign in to ContractLens'}
                {authModalView === 'register' && 'Create your Account'}
                {authModalView === 'verify-email' && 'Email Verification Required'}
              </h2>
              <p className="text-xs text-slate-400">
                {authModalView === 'verify-email'
                  ? 'Private contracts require verified identity'
                  : 'Zero-trust contract intelligence & secure audit trail'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          {/* VIEW: VERIFY EMAIL */}
          {authModalView === 'verify-email' ? (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 text-center">
                <Mail className="w-8 h-8 text-cyan-400 mx-auto mb-2 animate-bounce" />
                <h3 className="text-sm font-semibold text-white mb-1">Check your inbox</h3>
                <p className="text-xs text-slate-300 mb-2">
                  Please verify your email address before accessing private contracts.
                </p>
                <div className="inline-block px-3 py-1 rounded-full bg-[#07080F] border border-violet-700/40 text-xs font-mono text-cyan-300">
                  {userEmail || 'Your registered email'}
                </div>
              </div>

              {resendSuccess && (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verification email has been dispatched. Please check your spam folder if delayed.</span>
                </div>
              )}

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRefreshVerification}
                  disabled={refreshing}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Checking...' : 'Refresh verification status'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  Resend verification email
                </button>

                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full py-2 px-4 text-slate-400 hover:text-rose-300 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          ) : (
            /* VIEW: LOGIN OR REGISTER */
            <div className="space-y-4">
              {/* Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium text-xs flex items-center justify-center gap-3 transition-all hover:border-violet-500/50 cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.8 14.8 1 12 1 7.4 1 3.5 3.6 1.6 7.4l3.7 2.9C6.2 7.4 8.8 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.3 14.7c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4L1.6 7.4C.6 9.4 0 11.6 0 14.7s.6 5.3 1.6 7.3l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3.2 0-5.8-2.4-6.7-5.3L1.6 16.4C3.5 20.2 7.4 23.5 12 23.5z"
                  />
                </svg>
                <span className="font-semibold tracking-wide">CONTINUE WITH GOOGLE</span>
              </button>

              <div className="flex items-center gap-3 my-3">
                <div className="h-[1px] flex-1 bg-violet-950/80" />
                <span className="text-[11px] text-slate-500 uppercase tracking-widest font-mono">or email</span>
                <div className="h-[1px] flex-1 bg-violet-950/80" />
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {authModalView === 'register' && (
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Elena Vance"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080F] border border-violet-950 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="corporate@enterprise.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080F] border border-violet-950 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080F] border border-violet-950 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  <span>{authModalView === 'login' ? 'SIGN IN' : 'SIGN UP'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Toggle Login / Register */}
              <div className="pt-2 text-center text-xs text-slate-400">
                {authModalView === 'login' ? (
                  <span>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => openAuthModal('register')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                    >
                      SIGN UP
                    </button>
                  </span>
                ) : (
                  <span>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => openAuthModal('login')}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2 ml-1 cursor-pointer"
                    >
                      SIGN IN
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
