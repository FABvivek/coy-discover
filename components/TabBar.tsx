'use client';

import React from 'react';
import { Compass, Home } from 'lucide-react';

interface TabBarProps {
  activeTab: 'home' | 'discover';
  onTabChange: (tab: 'home' | 'discover') => void;
  matchesCount?: number;
}

export function TabBar({ activeTab, onTabChange, matchesCount = 0 }: TabBarProps) {
  return (
    <nav
      aria-label="Main navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-bg-card/95 border-t border-line backdrop-blur-md safe-pb"
    >
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-6">
        <button
          type="button"
          onClick={() => onTabChange('home')}
          aria-label="Home tab"
          aria-selected={activeTab === 'home'}
          role="tab"
          className={`flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-colors ${
            activeTab === 'home'
              ? 'text-ink-primary font-medium'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <Home className="w-5 h-5 stroke-[1.75]" />
          <span className="text-[11px] tracking-wide">Home</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange('discover')}
          aria-label="Discover tab"
          aria-selected={activeTab === 'discover'}
          role="tab"
          className={`relative flex flex-col items-center justify-center min-w-[64px] min-h-[44px] gap-1 transition-colors ${
            activeTab === 'discover'
              ? 'text-accent font-medium'
              : 'text-ink-secondary hover:text-ink-primary'
          }`}
        >
          <div className="relative">
            <Compass className="w-5 h-5 stroke-[1.75]" />
            {matchesCount > 0 && (
              <span
                aria-label={`${matchesCount} mutual matches`}
                className="absolute -top-1 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-accent text-white text-[10px] font-medium flex items-center justify-center"
              >
                {matchesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] tracking-wide">Discover</span>
        </button>
      </div>
    </nav>
  );
}
