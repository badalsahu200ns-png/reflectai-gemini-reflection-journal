import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Brain,
  Search,
  TrendingUp,
  ShieldCheck,
  Share2,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { THEME_TOKENS, BTN_CLASSES } from '../utils/themeTokens';

export const LandingView: React.FC = () => {
  const { signInWithGoogle, loading, error, clearError } = useAuth();
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-between selection:bg-[#76B900]/20 selection:text-[#76B900] ${
      isDark ? 'bg-[#0B0D0E] text-neutral-100' : 'bg-neutral-50 text-[#1A1A1A]'
    }`}>
      {/* Top Banner Navigation */}
      <header className={`border-b sticky top-0 z-30 backdrop-blur-md ${
        isDark ? 'border-neutral-800/80 bg-[#0B0D0E]/90' : 'border-neutral-200/80 bg-white/90'
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#76B900] flex items-center justify-center text-black shadow-xs shadow-[#76B900]/30 font-bold">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#1A1A1A] dark:text-white">
                Reflect AI
              </span>
              <span className="block text-[10px] text-[#595959] dark:text-neutral-400 font-mono leading-none mt-0.5">
                Personal Gemini Journal
              </span>
            </div>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs ${BTN_CLASSES.primary}`}
            id="btn-nav-signin"
          >
            <span>Continue with Google</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 flex flex-col items-center justify-center text-center">
        {/* Calm Privacy Guarantee Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-6 border bg-[#17DBCF]/10 text-[#008f87] dark:text-[#17DBCF] border-[#17DBCF]/30 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-[#17DBCF]" />
          <span>Your thoughts. Your memory. Your patterns.</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif tracking-tight font-semibold leading-[1.15] text-[#1A1A1A] dark:text-[#F5F5F5] max-w-3xl">
          Your journal that <span className="text-[#76B900]">remembers</span>,{' '}
          reflects, and helps you notice patterns.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-[#333333] dark:text-neutral-300 max-w-2xl leading-relaxed">
          Write freely with voice, photo scan, or text. ReflectAI securely retrieves relevant context from your past entries to generate personalized insights and deep self-awareness.
        </p>

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 max-w-md w-full bg-[#F44336]/10 border border-[#F44336]/30 rounded-xl text-xs text-[#F44336] flex items-start justify-between gap-3 text-left">
            <span>{error}</span>
            <button onClick={clearError} className="text-[#F44336] hover:opacity-80 font-bold">&times;</button>
          </div>
        )}

        {/* Primary Call to Action Box */}
        <div className={`mt-8 p-6 sm:p-8 rounded-2xl border max-w-md w-full shadow-sm space-y-4 ${
          isDark ? 'bg-[#14171A] border-neutral-800' : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-center gap-2 text-xs font-semibold text-[#17DBCF]">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure by Google Cloud</span>
          </div>

          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl text-sm ${BTN_CLASSES.primary}`}
            id="btn-hero-google-signin"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#ffffff"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#ffffff"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#ffffff"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#ffffff"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{loading ? 'Authenticating...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* 4 Feature Pillars (Exact Specification) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14 max-w-5xl w-full text-left">
          {/* 1. Long-Term Memory: #17DBCF */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#111416] border-neutral-800/80 hover:border-[#17DBCF]/50' : 'bg-white border-neutral-200 hover:border-[#17DBCF]/50'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-[#17DBCF]/15 text-[#17DBCF] flex items-center justify-center mb-3">
              <Brain className="w-4 h-4 text-[#17DBCF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Long-Term Memory</h3>
            <p className="text-xs text-[#595959] dark:text-neutral-400 mt-1 leading-relaxed">
              ReflectAI remembers key thoughts, values, and past experiences to connect the dots across weeks and months.
            </p>
          </div>

          {/* 2. Ask My Journal: #9C27B0 */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#111416] border-neutral-800/80 hover:border-[#9C27B0]/50' : 'bg-white border-neutral-200 hover:border-[#9C27B0]/50'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-[#9C27B0]/15 text-[#9C27B0] flex items-center justify-center mb-3">
              <Search className="w-4 h-4 text-[#9C27B0]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Ask My Journal</h3>
            <p className="text-xs text-[#595959] dark:text-neutral-400 mt-1 leading-relaxed">
              Ask questions about your own past reflections. Receive grounded answers with exact date citations.
            </p>
          </div>

          {/* 3. Pattern Recognition: #595959 */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#111416] border-neutral-800/80 hover:border-neutral-600' : 'bg-white border-neutral-200 hover:border-neutral-400'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-[#595959]/15 text-[#595959] dark:text-neutral-300 flex items-center justify-center mb-3">
              <TrendingUp className="w-4 h-4 text-[#595959] dark:text-neutral-300" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">Pattern Recognition</h3>
            <p className="text-xs text-[#595959] dark:text-neutral-400 mt-1 leading-relaxed">
              Weekly and monthly syntheses uncover mood trends, recurring challenges, and meaningful emotional shifts.
            </p>
          </div>

          {/* 4. External Integrations: #2176FF */}
          <div className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#111416] border-neutral-800/80 hover:border-[#2176FF]/50' : 'bg-white border-neutral-200 hover:border-[#2176FF]/50'
          }`}>
            <div className="w-8 h-8 rounded-xl bg-[#2176FF]/15 text-[#2176FF] flex items-center justify-center mb-3">
              <Share2 className="w-4 h-4 text-[#2176FF]" />
            </div>
            <h3 className="text-sm font-semibold text-[#1A1A1A] dark:text-white">External Integrations</h3>
            <p className="text-xs text-[#595959] dark:text-neutral-400 mt-1 leading-relaxed">
              Connect Slack channels, Discord webhooks, and email digests with minimal, privacy-first payloads.
            </p>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className={`border-t py-6 text-center text-xs ${
        isDark ? 'border-neutral-800/80 text-[#595959]' : 'border-neutral-200/80 text-[#595959]'
      }`}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center">
          <span>ReflectAI &bull; Powered by Google Gemini & Cloud Firestore</span>
        </div>
      </footer>
    </div>
  );
};
