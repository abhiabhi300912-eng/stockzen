import React from 'react';
import { TabType, UserProfile } from '../types';

interface HeaderProps {
  activeTab: TabType;
  unreadCount: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSearch: () => void;
  onOpenGmail: () => void;
  user?: UserProfile;
  isLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  unreadCount,
  onOpenNotifications,
  onOpenProfile,
  onOpenSearch,
  onOpenGmail,
  user,
  isLive = true,
}) => {
  const getSubTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Dashboard';
      case 'charts':
        return 'Analysis';
      case 'sentiment':
        return 'Sentiment';
      case 'signals':
        return 'Prediction';
      case 'models':
        return 'Model Zoo';
      default:
        return 'Analysis';
    }
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#0f131d]/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-b border-[#262a35]/60">
      <div className="h-16 px-4 max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-2">
          <img
            alt="StockZen Brand Logo"
            className="h-8 w-auto object-contain cursor-pointer hover:opacity-90 transition-opacity"
            src="https://lh3.googleusercontent.com/aida/AEtjO1X5al9F2fCldMlZgqVS-3L7_5SvQo-jMebmvgB-CGOaNoXo8oSetZvU7iXoxj5b4q7YlWaUzMj5HhT0YCzpwsNDUJ6qWPtgmUGB8cuHww8Jo1lxf53szAs2MOyI9Lp65nqtD9_xNLyiaAuPWo3RmPiTUWgIAg-gbaf0vDE44XcBiXNWZQoNGY-rE4-K5l0rKTBfKJVH0EK3Abtzb0k0YRZyZY4-TQtZGtGx50E4puSUOAi4UXpqGMGcXGro"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-headline-sm text-[18px] text-[#dfe2f1] font-bold tracking-tight leading-none">
                StockZen
              </span>
              <span className="px-1.5 py-0.2 rounded bg-[#38bdf8]/15 text-[#8ed5ff] font-data-mono-sm text-[9px] font-bold leading-normal border border-[#38bdf8]/30">
                5,000+ STOCKS
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-body-sm text-[12px] text-[#bdc8d1] truncate max-w-[100px]">
                {getSubTitle()}
              </span>
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#262a35] text-[#56e5a9] font-data-mono-sm text-[11px] leading-none">
                <span className={`w-1.5 h-1.5 rounded-full bg-[#56e5a9] ${isLive ? 'animate-pulse' : ''}`} />
                NYSE LIVE
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          {/* Quick Search across 5,000+ stocks button */}
          <button
            onClick={onOpenSearch}
            aria-label="Search 5,000+ stocks"
            className="h-9 px-2.5 rounded-lg bg-[#1c1f2a] hover:bg-[#262a35] text-[#bdc8d1] hover:text-[#8ed5ff] transition-all flex items-center gap-1 border border-[#262a35] active:scale-95"
            title="Search 5,000+ stocks"
          >
            <span className="material-symbols-outlined text-[17px]">search</span>
            <span className="hidden sm:inline font-data-mono-sm text-[11px]">5,000+</span>
          </button>

          {/* Notifications Toggle */}
          <button
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-[#bdc8d1] hover:text-[#dfe2f1] active:bg-[#313540] transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#38bdf8] ring-2 ring-[#0f131d]" />
            )}
          </button>

          {/* Gmail Workspace Hub */}
          <button
            onClick={onOpenGmail}
            aria-label="Gmail Workspace Hub"
            title="Open Gmail: Send stock alerts, reports & read market emails"
            className="h-9 px-2 rounded-lg bg-[#1c1f2a] hover:bg-[#262a35] text-[#bdc8d1] hover:text-white transition-all flex items-center gap-1.5 border border-[#262a35] active:scale-95 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:scale-110" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4.9 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z"
                fill="#EA4335"
              />
            </svg>
            <span className="hidden sm:inline font-data-mono-sm text-[11px] text-[#dfe2f1]">Gmail</span>
          </button>

          {/* User Profile & Picture Trigger */}
          <button
            onClick={onOpenProfile}
            aria-label={`User Account: ${user?.name || 'User'}`}
            title={`Logged in as ${user?.name || 'User'} (${user?.email || ''}) • Click to change profile picture or edit user`}
            className="relative flex items-center justify-center p-0.5 rounded-full bg-[#262a35] hover:ring-2 hover:ring-[#38bdf8] transition-all active:scale-95 ml-0.5 group"
          >
            <img
              alt={user?.name || 'User Profile Picture'}
              className="w-8 h-8 rounded-full object-cover group-hover:brightness-90 transition-all"
              src={user?.avatarUrl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAEc7R5ZayzxdMe5khnNsqG_15F7cqa2LH-ruYuqRrUyz-u4xxtXKm67cRRSI3xOylIwSIn-R80Qrl657Szkaf3OBHXsn65_vi3yUlev6AEf5v8eAwb_2GIlK7sqA3WD4mg65rFQGMVypTIMqiO4-TazHnO2zUfU1u-Nq8Yd2ARDJmkopFmJVjmZm__c7AEt2Uru-gLFab01_1nRrxn7zpgjVEtthGfpXrVK8h1UvkB0ChNOSYq9Dcn8g"}
            />
            {/* Small camera badge overlay */}
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#38bdf8] text-[#001e2c] flex items-center justify-center shadow-sm pointer-events-none group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[9px] font-bold">photo_camera</span>
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
