import React from 'react';
import { TabType } from '../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dash', icon: 'trending_up' },
    { id: 'charts', label: 'Charts', icon: 'candlestick_chart' },
    { id: 'sentiment', label: 'Sentiment', icon: 'sensors' },
    { id: 'signals', label: 'Signals', icon: 'neurology' },
    { id: 'models', label: 'Models', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 w-full z-40 pb-safe bg-[#0a0e18]/90 backdrop-blur-xl border-t border-[#262a35]/60 shadow-[0_-1px_12px_rgba(0,0,0,0.5)]">
      <div className="flex justify-between items-center h-16 max-w-lg mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center w-full h-12 transition-all gap-0.5 group active:scale-95 ${
                isActive
                  ? 'text-[#8ed5ff] font-semibold'
                  : 'text-[#bdc8d1] hover:text-[#dfe2f1]'
              }`}
            >
              <span
                className={`material-symbols-outlined text-[20px] transition-transform ${
                  isActive ? 'scale-110 drop-shadow-[0_0_8px_rgba(142,213,255,0.4)]' : 'group-hover:scale-105'
                }`}
                style={isActive ? { fontVariationSettings: "'FILL' 1" } : { fontVariationSettings: "'FILL' 0" }}
              >
                {tab.icon}
              </span>
              <span className="font-data-mono-sm text-[11px] leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
