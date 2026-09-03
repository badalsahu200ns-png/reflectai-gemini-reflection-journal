import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Brain,
  Search,
  TrendingUp,
  Share2,
  AlertCircle,
  Lock,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DailyReflectionQuote } from './DailyReflectionQuote';

export const LoginView: React.FC = () => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col justify-between selection:bg-[#76B900]/30 selection:text-[#76B900] ${
        isDark ? 'bg-[#000000] text-[#F5F5F5]' : 'bg-neutral-950 text-[#F5F5F5]'
      }`}
    >
      {/* Top Header Navigation */}
      <header className="border-b border-neutral-800/80 sticky top-0 z-30 backdrop-blur-md bg-[#000000]/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#76B900] flex items-center justify-center text-black shadow-sm shadow-[#76B900]/30 font-bold">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#F5F5F5]">
                Reflect<span className="text-[#76B900]">AI</span>
              </span>
              <span className="block text-[10px] text-[#BDBDBD] font-mono leading-none mt-0.5">
                Personal Gemini 3.6 Flash Journal
              </span>
            </div>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#76B900] hover:bg-[#88d400] text-black shadow-md hover:shadow-[#76B900]/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            id="btn-header-google-signin"
          >
            <span>Continue with Google</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Login & Reflection Container */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex flex-col items-center justify-center text-center w-full">
        {/* Security & Authenticity Trust Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border bg-[#76B900]/10 text-[#76B900] border-[#76B900]/30 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#76B900]" />
          <span>Secure Google Sign-In &bull; Private Journal Encryption &bull; Zero Data Leaks</span>
        </div>

        {/* Primary App Title & Brand Hierarchy */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-[#F5F5F5] leading-tight max-w-3xl">
          Reflect<span className="text-[#76B900]">AI</span>
        </h1>

        <p className="mt-3 text-base sm:text-xl font-sans text-[#E5E5E5] max-w-2xl leading-relaxed font-normal">
          Your journal that remembers, reflects, and helps you notice patterns.
        </p>

        {/* Dynamic 7-Day Daily Reflection Quote Experience */}
        <div className="mt-8 w-full max-w-2xl">
          <DailyReflectionQuote showTagline={true} />
        </div>

        {/* Error Notification Banner */}
        {error && (
          <div className="mt-6 p-4 max-w-md w-full bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start justify-between gap-3 text-left shadow-xl">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white font-bold text-sm px-1 cursor-pointer"
              aria-label="Dismiss error"
            >
              &times;
            </button>
          </div>
        )}

        {/* Google Authentication Box (Official Firebase / Google Identity styling) */}
        <div className="mt-8 p-6 sm:p-8 rounded-2xl bg-[#0A0A0A] border border-neutral-800 shadow-2xl max-w-md w-full text-left space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800/80">
            <div className="flex items-center gap-2 text-xs font-mono font-semibold text-[#76B900]">
              <Lock className="w-3.5 h-3.5 text-[#76B900]" />
              <span>Authentication</span>
            </div>
            <span className="text-[10px] font-mono text-[#BDBDBD]">Zero Password Storage</span>
          </div>

          <p className="text-xs text-[#BDBDBD] leading-relaxed">
            Sign in securely with your Google account to access your encrypted personal reflections.
          </p>

          {/* Official Google Sign-In Button */}
          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-100 active:bg-neutral-200 text-neutral-900 text-sm font-semibold transition-all shadow-lg hover:shadow-white/10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-200"
            id="btn-login-google"
          >
            {/* Official Multi-Color Google G SVG Icon */}
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span className="text-neutral-900 font-medium">
              {loading ? 'Opening Google Sign-In...' : 'Continue with Google'}
            </span>
          </button>

          {/* Verification Step Notice */}
          <div className="pt-2 flex items-start gap-2 text-[11px] text-[#BDBDBD] leading-relaxed">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#76B900] shrink-0 mt-0.5" />
            <span>
              Direct federated authentication powered by Google Identity and Firebase Authentication.
            </span>
          </div>
        </div>

        {/* 4 Feature Pillars (High Visibility Contrast) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-4xl w-full text-left">
          {/* 1. Long-Term Memory */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#76B900]/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-[#76B900]/15 text-[#76B900] flex items-center justify-center mb-3">
              <Brain className="w-4 h-4 text-[#76B900]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F5F5]">Long-Term Memory</h2>
            <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
              ReflectAI securely recalls key thoughts, values, and past experiences to connect insights across time.
            </p>
          </div>

          {/* 2. Ask My Journal */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#FFD600]/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-[#FFD600]/15 text-[#FFD600] flex items-center justify-center mb-3">
              <Search className="w-4 h-4 text-[#FFD600]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F5F5]">Ask My Journal</h2>
            <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
              Inquire into past reflections and receive grounded answers with exact date citations.
            </p>
          </div>

          {/* 3. Pattern Recognition */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800 hover:border-neutral-700 transition-all">
            <div className="w-8 h-8 rounded-xl bg-neutral-800 text-[#F5F5F5] flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 text-[#76B900]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F5F5]">Pattern Recognition</h2>
            <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
              Weekly and monthly syntheses uncover mood trajectories and recurring emotional rhythms.
            </p>
          </div>

          {/* 4. External Integrations */}
          <div className="p-5 rounded-2xl bg-[#0A0A0A] border border-neutral-800 hover:border-[#76B900]/50 transition-all">
            <div className="w-8 h-8 rounded-xl bg-[#76B900]/15 text-[#76B900] flex items-center justify-center mb-3">
              <Share2 className="w-4 h-4 text-[#76B900]" />
            </div>
            <h2 className="text-sm font-semibold text-[#F5F5F5]">Integrations</h2>
            <p className="text-xs text-[#BDBDBD] mt-1 leading-relaxed">
              Dispatch private summaries to Slack, Discord webhooks, or encrypted email digests.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 py-5 text-center text-xs text-[#BDBDBD] bg-[#000000]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReflectAI &bull; Powered by Google Gemini 3.6 Flash & Cloud Firestore</span>
          <span className="text-[11px] text-neutral-400 font-mono">End-to-End Encrypted &bull; 2FA Secured</span>
        </div>
      </footer>
    </div>
  );
};
