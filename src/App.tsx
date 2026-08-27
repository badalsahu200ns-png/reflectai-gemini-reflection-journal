import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error in ReflectAI:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="max-w-md w-full p-6 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h1 className="text-base font-bold text-white">Temporary Application Glitch</h1>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {this.state.error?.message || 'An unexpected rendering error occurred. Your journal data in Firestore remains completely safe.'}
            </p>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow"
            >
              <RefreshCw className="w-4 h-4" />
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const MainApp: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-neutral-400 gap-3">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-mono tracking-wider">Verifying authenticated session...</p>
      </div>
    );
  }

  return user ? <DashboardView /> : <LandingView />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

