import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingView } from './components/LandingView';
import { DashboardView } from './components/DashboardView';

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
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
