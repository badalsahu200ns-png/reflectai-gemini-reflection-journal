import React from 'react';
import {
  Home,
  PenTool,
  Search,
  TrendingUp,
  Brain,
  Star,
  ShieldCheck,
  Settings,
  LogOut,
  Moon,
  Sun,
  Sparkles,
  Flame,
  User,
  Plus,
  Bell,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { DashboardTab } from './DashboardView';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  onNewReflection: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  entriesCount: number;
  memoriesCount: number;
  favoritesCount: number;
  streakDays?: number;
  gamificationEnabled?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onNewReflection,
  onOpenNotifications,
  unreadNotificationsCount = 0,
  entriesCount,
  memoriesCount,
  favoritesCount,
  streakDays = 1,
  gamificationEnabled = true
}) => {
  const { user, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const navItems: {
    id: DashboardTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    color: string;
  }[] = [
    { id: 'home', label: 'Home', icon: Home, color: '#76B900' },
    { id: 'journal', label: 'Journal', icon: PenTool, badge: entriesCount, color: '#595959' },
    { id: 'ask', label: 'Ask My Journal', icon: Search, color: '#9C27B0' },
    { id: 'insights', label: 'Insights', icon: TrendingUp, color: '#595959' },
    { id: 'memories', label: 'Memories', icon: Brain, badge: memoriesCount, color: '#17DBCF' },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: favoritesCount, color: '#F4B400' },
    { id: 'privacy', label: 'Privacy Center', icon: ShieldCheck, color: '#17DBCF' },
    { id: 'admin', label: 'Governance / Admin', icon: ShieldAlert, color: '#17DBCF' },
    { id: 'settings', label: 'Settings', icon: Settings, color: '#888888' }
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside
        className="hidden md:flex flex-col w-64 shrink-0 border-r border-[#1F2428] h-screen sticky top-0 transition-colors select-none z-20 bg-[#0B0D0E] text-white"
        id="desktop-sidebar-nav"
      >
        {/* Brand & Action Buttons */}
        <div className="p-5 pb-4 space-y-4 border-b border-[#1F2428]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#76B900] flex items-center justify-center text-black font-bold shadow-[0_0_12px_rgba(118,185,0,0.25)]">
                <Sparkles className="w-4 h-4 text-black" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                  Reflect AI
                  <span className="text-[9px] font-mono uppercase bg-[#76B900]/15 text-[#76B900] px-1.5 py-0.5 rounded border border-[#76B900]/30 font-bold">
                    PRO
                  </span>
                </span>
                <span className="block text-[10px] text-neutral-400 font-sans leading-none mt-0.5">
                  Personal Gemini Journal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Notification Center Trigger */}
              <button
                onClick={onOpenNotifications}
                className="relative p-1.5 rounded-lg bg-[#111416] border border-[#22272B] text-neutral-400 hover:text-white hover:bg-[#171A1C] transition-colors"
                title="Open Notification Center"
                id="btn-sidebar-notifications"
              >
                <Bell className="w-3.5 h-3.5 text-[#76B900]" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F44336] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg bg-[#111416] border border-[#22272B] text-neutral-400 hover:text-white hover:bg-[#171A1C] transition-colors"
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                id="btn-sidebar-theme-toggle"
              >
                {isDark ? <Sun className="w-3.5 h-3.5 text-[#F4B400]" /> : <Moon className="w-3.5 h-3.5 text-[#9C27B0]" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button (Red #F44336 per section 4) */}
          <button
            onClick={onNewReflection}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F44336] hover:bg-[#D32F2F] text-white text-xs font-semibold shadow-xs transition-all active:scale-[0.98]"
            id="btn-sidebar-new-reflection"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Start Reflection</span>
          </button>
        </div>

        {/* Primary Navigation Links */}
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#14171A] text-white font-semibold border border-[#76B900]/50 shadow-[0_0_12px_rgba(118,185,0,0.12)]'
                    : 'text-neutral-400 hover:text-white hover:bg-[#111416]'
                }`}
                id={`sidebar-tab-${item.id}`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className="w-4 h-4 transition-colors shrink-0"
                    style={{ color: isActive ? '#76B900' : item.color }}
                  />
                  <span>{item.label}</span>
                </div>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-[#76B900]/20 text-[#76B900] border border-[#76B900]/40'
                        : 'bg-[#111416] text-neutral-400 border border-[#22272B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Streak widget */}
        {gamificationEnabled && (
          <div className="px-4 py-2.5 mx-3 mb-2 rounded-xl bg-[#111416] border border-[#1F2428] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-[#F4B400]" />
              <span className="text-xs font-semibold text-white">
                {streakDays}-day streak
              </span>
            </div>
            <span className="text-[10px] text-[#76B900] font-mono font-bold">MINDFUL</span>
          </div>
        )}

        {/* User Profile & Sign Out Footer */}
        <div className="p-3 border-t border-[#1F2428]">
          <div className="p-2.5 rounded-xl bg-[#111416] flex items-center justify-between gap-2 border border-[#22272B]">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full object-cover shrink-0 border border-[#76B900]/40"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#171A1C] border border-[#76B900]/40 text-[#76B900] flex items-center justify-center shrink-0 text-xs font-bold">
                  {user?.displayName ? user.displayName.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {user?.displayName || 'ReflectAI User'}
                </p>
                <p className="text-[10px] text-neutral-400 truncate font-mono">
                  {user?.email || 'Authenticated'}
                </p>
              </div>
            </div>

            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-[#F44336] hover:bg-[#171A1C] transition-colors"
              title="Sign Out"
              id="btn-sidebar-signout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-[#1F2428] flex items-center justify-around px-2 z-30 bg-[#0B0D0E]/95 text-neutral-400 backdrop-blur-md"
        id="mobile-bottom-nav"
      >
        {[
          { id: 'home', label: 'Home', icon: Home, color: '#76B900' },
          { id: 'journal', label: 'Journal', icon: PenTool, color: '#595959' },
          { id: 'ask', label: 'Ask AI', icon: Search, color: '#9C27B0' },
          { id: 'insights', label: 'Insights', icon: TrendingUp, color: '#595959' },
          { id: 'settings', label: 'Settings', icon: Settings, color: '#888888' }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as DashboardTab)}
              className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
                isActive ? 'text-[#76B900] font-semibold' : 'text-neutral-400 hover:text-neutral-200'
              }`}
              id={`mobile-tab-${item.id}`}
            >
              <Icon className="w-5 h-5" style={{ color: isActive ? '#76B900' : item.color }} />
              <span className="text-[10px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
