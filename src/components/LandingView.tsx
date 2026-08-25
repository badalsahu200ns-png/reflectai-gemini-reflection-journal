import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  Lock,
  Database,
  ArrowRight,
  CheckCircle2,
  BrainCircuit,
  MessageSquareQuote,
  BookOpen,
  Cpu,
  Zap,
  LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LandingView: React.FC = () => {
  const { signInWithGoogle, signInAsDemoUser, loading, error, clearError } = useAuth();
  const [demoName, setDemoName] = useState('Badal Sahu');

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 flex flex-col justify-between selection:bg-neutral-800 selection:text-white">
      {/* Top Banner / Navigation */}
      <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white">ReflectAI</span>
              <span className="ml-2 text-[10px] font-mono uppercase bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded border border-neutral-700">
                Gemini 3.6 Flash
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => signInWithGoogle()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              id="btn-nav-signin"
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In with Google
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col items-center justify-center text-center">
        {/* Security Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-800/90 border border-neutral-700 text-neutral-300 text-xs mb-8">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>User-Isolated Cloud Firestore Database &bull; Zero Insecure Defaults</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-3xl">
          Deep, Conversational Reflections Powered by{' '}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            Gemini 3.6 Flash
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-neutral-400 max-w-2xl leading-relaxed">
          Write multi-turn journal reflections, brainstorm bold ideas, and receive structured AI summaries.
          Every entry is strictly isolated to your authenticated account in Cloud Firestore.
        </p>

        {/* Error Alert if any */}
        {error && (
          <div className="mt-6 p-4 max-w-md w-full bg-red-950/60 border border-red-800/80 rounded-xl text-xs text-red-200 flex items-start justify-between gap-3 text-left">
            <span>{error}</span>
            <button onClick={clearError} className="text-red-400 hover:text-white font-bold">&times;</button>
          </div>
        )}

        {/* Primary Call to Action Box */}
        <div className="mt-10 p-6 sm:p-8 bg-neutral-950 border border-neutral-800 rounded-2xl max-w-md w-full shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider text-neutral-300">
            Authenticate to Enter Private Dashboard
          </h2>

          <button
            onClick={() => signInWithGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-950 text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
            id="btn-hero-google-signin"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            {loading ? 'Authenticating...' : 'Continue with Google Account'}
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-800"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
              <span className="bg-neutral-950 px-2 text-neutral-500">Or Quick Preview</span>
            </div>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              value={demoName}
              onChange={(e) => setDemoName(e.target.value)}
              placeholder="Your Name (e.g. Badal Sahu)"
              className="w-full text-xs px-3 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-1 focus:ring-purple-500 font-medium"
            />
            <button
              onClick={() => signInAsDemoUser(demoName)}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition-all border border-neutral-700"
              id="btn-demo-signin"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
              Launch Isolated Journal Sandbox
            </button>
          </div>

          <p className="text-[11px] text-neutral-500 text-center">
            Zero password storage &bull; Firestore owner-bound isolation (`request.auth.uid == userId`)
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-16 max-w-4xl w-full text-left">
          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-purple-950/70 border border-purple-800/50 flex items-center justify-center mb-3">
              <MessageSquareQuote className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Multi-Turn Reflective Dialogue</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Engage in multi-turn conversations with Gemini 3.6 Flash. Receive empathetic validation, constructive reframing, and insightful inquiries.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/70 border border-indigo-800/50 flex items-center justify-center mb-3">
              <Database className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">User-Isolated Firestore Storage</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Every prompt, response, and summary is synchronized to your personal collection at <code className="text-neutral-300 font-mono text-[10px]">/users/{'{userId}'}/entries</code>.
            </p>
          </div>

          <div className="p-5 rounded-xl bg-neutral-950/60 border border-neutral-800">
            <div className="w-8 h-8 rounded-lg bg-blue-950/70 border border-blue-800/50 flex items-center justify-center mb-3">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Structured AI Summarization</h3>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Synthesize extensive reflections into executive summaries, key themes, psychological growth insights, and actionable next steps.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>ReflectAI &bull; Powered by Google Gemini 3.6 Flash & Cloud Firestore</span>
          <span className="font-mono text-[11px] text-neutral-400">Owner-Bound Path Isolation (`request.auth.uid == userId`)</span>
        </div>
      </footer>
    </div>
  );
};
