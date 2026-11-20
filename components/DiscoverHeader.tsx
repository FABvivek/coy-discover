'use client';

import React from 'react';
import { RotateCcw, Moon, Sun } from 'lucide-react';

interface DiscoverHeaderProps {
  activeView: 'swipe' | 'matches';
  onViewChange: (view: 'swipe' | 'matches') => void;
  matchesCount: number;
  onReset: () => void;
  isResetting: boolean;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function DiscoverHeader({
  activeView,
  onViewChange,
  matchesCount,
  onReset,
  isResetting,
  isDark,
  onToggleTheme,
}: DiscoverHeaderProps) {
  return (
    <header className="sticky top-0 z-20 w-full bg-bg-primary/90 backdrop-blur-md border-b border-line px-4 pt-3 pb-3 transition-colors">
      <div className="max-w-md mx-auto flex items-center justify-between gap-2">
        {/* Coy wordmark */}
        <div className="flex items-center gap-2">
          <span className="font-serif text-2xl font-normal tracking-tight text-ink-primary">
            coy
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent mb-0.5 opacity-80" />
        </div>

        {/* Segmented control: Swipe / Matches */}
        <div
          role="tablist"
          aria-label="Discover views"
          className="flex items-center bg-bg-secondary p-0.5 rounded-full border border-line"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'swipe'}
            onClick={() => onViewChange('swipe')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px] ${
              activeView === 'swipe'
                ? 'bg-bg-card text-ink-primary shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            Discover
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeView === 'matches'}
            onClick={() => onViewChange('matches')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all min-h-[32px] ${
              activeView === 'matches'
                ? 'bg-bg-card text-ink-primary shadow-sm'
                : 'text-ink-secondary hover:text-ink-primary'
            }`}
          >
            <span>Matches</span>
            {matchesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-accent/15 text-accent font-semibold">
                {matchesCount}
              </span>
            )}
          </button>
        </div>

        {/* Actions: Theme Toggle & Reset Demo Data */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-full text-ink-secondary hover:text-ink-primary hover:bg-bg-secondary transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={isResetting}
            aria-label="Reset demo data"
            title="Reset demo data (clears swipes and matches)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-medium text-ink-secondary hover:text-ink-primary hover:bg-bg-secondary transition-colors disabled:opacity-50 min-h-[36px]"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset demo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
