import React, { useState } from 'react';
import {
  Sparkles,
  LogOut,
  ShieldCheck,
  User as UserIcon,
  Database,
  Info,
  CheckCircle2,
  Key,
  Palette,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';

interface NavbarProps {
  onOpenSecurityInspector: () => void;
  entriesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSecurityInspector, entriesCount }) => {
  const { user, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-white tracking-tight">ReflectAI</span>
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-purple-950/80 text-purple-300 px-2 py-0.5 rounded border border-purple-800/60">
              Gemini 3.6 Flash
            </span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              <CheckCircle2 className="w-3 h-3" />
              Firestore Isolated
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Theme Switcher Button */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-800 transition-colors"
            title="Switch Journal Theme"
            id="btn-nav-themes"
          >
            <Palette className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Themes</span>
          </button>

          {/* Notifications / Webhooks Modal Button */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-800 transition-colors"
            title="Notifications & Webhook Integrations"
            id="btn-nav-notifications"
          >
            <Bell className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Notifications</span>
          </button>

          {/* Security & Rules Inspector Button */}
          <button
            onClick={onOpenSecurityInspector}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium border border-neutral-800 transition-colors"
            title="Inspect Security Rules & Secret Isolation"
            id="btn-nav-security-rules"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Rules & Architecture</span>
          </button>

          {/* User Profile / Menu */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-neutral-900 border border-neutral-800/80 transition-all text-left"
                id="btn-user-avatar"
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full bg-neutral-800 object-cover border border-neutral-700"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.displayName || 'Reflective User'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {user.email || 'Isolated Session'}
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-neutral-900 border border-neutral-800 shadow-2xl p-3 z-50 space-y-3">
                    <div className="border-b border-neutral-800 pb-2">
                      <div className="text-xs font-semibold text-white">
                        {user.displayName || 'Active Account'}
                      </div>
                      <div className="text-[11px] text-neutral-400 font-mono truncate">
                        {user.email || 'No email attached'}
                      </div>
                      <div className="mt-1 text-[10px] text-neutral-500 font-mono">
                        UID: <span className="text-neutral-400">{user.uid.slice(0, 16)}...</span>
                      </div>
                    </div>

                    <div className="text-[11px] text-neutral-400 space-y-1">
                      <div className="flex justify-between">
                        <span>Total Entries:</span>
                        <span className="text-white font-semibold">{entriesCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Path:</span>
                        <span className="text-neutral-300 font-mono text-[10px]">/users/{user.uid.slice(0, 6)}...</span>
                      </div>
                    </div>

                    <div className="border-t border-neutral-800 pt-2">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 text-xs font-medium border border-red-900/50 transition-colors"
                        id="btn-dropdown-signout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Theme Selection Modal */}
      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />

      {/* Notifications Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
      />
    </>
  );
};
