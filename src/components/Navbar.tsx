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
  Bell,
  ChevronDown
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
            <div className="relative flex items-center gap-2">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-neutral-900 border border-neutral-800/80 hover:border-purple-500/40 transition-all text-left group"
                id="btn-user-avatar"
                title="Click profile to open account menu & sign out"
                aria-label="User profile menu"
              >
                <div className="relative">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full bg-neutral-800 object-cover border border-neutral-700 ring-2 ring-purple-500/20 group-hover:ring-purple-500/50 transition-all"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // Fallback image if dicebear/photoURL fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 ring-2 ring-neutral-950" />
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <div className="text-xs font-semibold text-white leading-tight truncate max-w-[120px]">
                    {user.displayName || 'Reflective User'}
                  </div>
                  <div className="text-[10px] text-neutral-400 truncate max-w-[120px]">
                    {user.email || 'Google Account'}
                  </div>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-transform duration-200 ${showUserMenu ? 'rotate-180 text-purple-400' : ''}`} />
              </button>

              {/* Direct Quick Sign Out Button */}
              <button
                onClick={() => signOut()}
                className="hidden sm:inline-flex p-2 rounded-lg bg-neutral-900 hover:bg-red-950/60 text-neutral-400 hover:text-red-400 border border-neutral-800 transition-colors"
                title="Quick Log Out"
                id="btn-nav-quick-signout"
                aria-label="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-neutral-900 border border-neutral-800 shadow-2xl p-4 z-50 space-y-3.5 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center gap-3 pb-3 border-b border-neutral-800">
                      <img
                        src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                        alt={user.displayName || 'User'}
                        className="w-10 h-10 rounded-full bg-neutral-800 object-cover border border-neutral-700 ring-2 ring-purple-500/40"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-white truncate">
                          {user.displayName || 'Active Account'}
                        </div>
                        <div className="text-[11px] text-neutral-400 truncate">
                          {user.email || 'Google Account Connected'}
                        </div>
                        <span className="inline-block text-[9px] font-mono uppercase bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/60 mt-1">
                          Protected Session
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-neutral-400 bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/60">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Total Reflections:</span>
                        <span className="text-white font-mono font-semibold">{entriesCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">Cloud Firestore:</span>
                        <span className="text-purple-300 font-mono text-[10px]">Owner-Isolated</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-500">UID:</span>
                        <span className="text-neutral-400 font-mono text-[10px]">{user.uid.slice(0, 10)}...</span>
                      </div>
                    </div>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          signOut();
                        }}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-200 hover:text-white text-xs font-semibold border border-red-800/60 hover:border-red-700 transition-all shadow-sm active:scale-[0.99]"
                        id="btn-dropdown-signout"
                      >
                        <LogOut className="w-4 h-4 text-red-400" />
                        <span>Log Out / Sign Out</span>
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
