'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, Check, ArrowLeft, ArrowRight, RotateCcw, AlertCircle } from 'lucide-react';
import { Profile, SwipeDirection } from '@/lib/types';
import { SwipeCard } from './SwipeCard';

interface CardStackProps {
  profiles: Profile[];
  onSwipe: (profileId: string, direction: SwipeDirection) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onResetDemo: () => void;
  isResetting: boolean;
}

export function CardStack({
  profiles,
  onSwipe,
  isLoading,
  error,
  onRetry,
  onResetDemo,
  isResetting,
}: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<SwipeDirection | null>(null);
  const [isSwipingLocked, setIsSwipingLocked] = useState(false);

  // Reset index if profiles list changes completely (e.g. on reset demo)
  useEffect(() => {
    setCurrentIndex(0);
    setExitDirection(null);
  }, [profiles]);

  const activeProfile = profiles[currentIndex];
  const nextProfile = profiles[currentIndex + 1];

  const handleSwipeAction = useCallback(
    async (direction: SwipeDirection) => {
      if (isSwipingLocked || !activeProfile) return;

      setIsSwipingLocked(true);
      setExitDirection(direction);

      // Allow card exit animation to finish before updating index
      setTimeout(async () => {
        try {
          await onSwipe(activeProfile.id, direction);
        } finally {
          setCurrentIndex((prev) => prev + 1);
          setExitDirection(null);
          setIsSwipingLocked(false);
        }
      }, 260);
    },
    [activeProfile, isSwipingLocked, onSwipe]
  );

  // Desktop keyboard listeners (ArrowLeft = Pass, ArrowRight = Like)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input/button or modal
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleSwipeAction('pass');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleSwipeAction('like');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSwipeAction]);

  // Loading state: refined skeleton card
  if (isLoading) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-4 py-6">
        <div className="relative w-full aspect-[3/4.2] max-h-[560px] rounded-[28px] overflow-hidden bg-bg-secondary border border-line animate-pulse flex flex-col justify-end p-6">
          <div className="w-2/3 h-8 bg-ink-muted/20 rounded-md mb-2" />
          <div className="w-1/3 h-4 bg-ink-muted/20 rounded-md mb-4" />
          <div className="w-full h-3 bg-ink-muted/15 rounded-md mb-2" />
          <div className="w-4/5 h-3 bg-ink-muted/15 rounded-md mb-4" />
          <div className="flex gap-2">
            <div className="w-16 h-6 bg-ink-muted/20 rounded-full" />
            <div className="w-20 h-6 bg-ink-muted/20 rounded-full" />
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-6">
          <div className="w-14 h-14 rounded-full bg-bg-secondary animate-pulse" />
          <div className="w-14 h-14 rounded-full bg-bg-secondary animate-pulse" />
        </div>
      </div>
    );
  }

  // Error state: clear message and retry button
  if (error) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="w-12 h-12 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl font-medium text-ink-primary mb-2">
          Unable to load feed
        </h3>
        <p className="text-sm text-ink-secondary mb-6 leading-relaxed max-w-xs">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="px-5 py-2.5 rounded-full bg-ink-primary text-bg-primary text-sm font-medium hover:opacity-90 active:scale-95 transition-all min-h-[44px]"
        >
          Try again
        </button>
      </div>
    );
  }

  // Empty state: All caught up
  if (!activeProfile || currentIndex >= profiles.length) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-bg-secondary border border-line flex items-center justify-center text-ink-secondary mb-5">
          <RotateCcw className="w-6 h-6 opacity-60" />
        </div>
        <h3 className="font-serif text-2xl font-normal text-ink-primary mb-2 tracking-tight">
          You&apos;re all caught up
        </h3>
        <p className="text-sm text-ink-secondary mb-8 leading-relaxed max-w-xs">
          New people will show up here soon. In the meantime, you can reset the demo data to start fresh.
        </p>
        <button
          type="button"
          onClick={onResetDemo}
          disabled={isResetting}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-ink-primary text-bg-primary text-sm font-medium hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 min-h-[44px] shadow-sm"
        >
          <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset demo data</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto flex flex-col items-center px-4 pt-2 pb-6">
      {/* Visual Card Stack Viewport */}
      <div className="relative w-full aspect-[3/4.2] max-h-[560px] select-none">
        {/* Next card recessed behind */}
        {nextProfile && (
          <SwipeCard
            key={nextProfile.id}
            profile={nextProfile}
            isFront={false}
          />
        )}

        {/* Top active draggable card */}
        <SwipeCard
          key={activeProfile.id}
          profile={activeProfile}
          isFront={true}
          onSwipe={handleSwipeAction}
          exitDirection={exitDirection}
        />
      </div>

      {/* Action Controls for Desktop / Touch */}
      <div className="flex items-center justify-center gap-8 mt-6">
        {/* Pass Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSwipeAction('pass')}
            disabled={isSwipingLocked}
            aria-label="Pass (Left arrow)"
            className="w-14 h-14 rounded-full border border-line bg-bg-card flex items-center justify-center text-pass hover:text-ink-primary hover:border-ink-secondary/40 active:scale-95 transition-all shadow-button disabled:opacity-40 min-h-[44px] min-w-[44px]"
          >
            <X className="w-6 h-6 stroke-[2]" />
          </button>
          <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
            <ArrowLeft className="w-2.5 h-2.5" /> Pass
          </span>
        </div>

        {/* Like Button */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleSwipeAction('like')}
            disabled={isSwipingLocked}
            aria-label="Like (Right arrow)"
            className="w-14 h-14 rounded-full border border-accent/25 bg-bg-card flex items-center justify-center text-accent hover:bg-accent hover:text-white active:scale-95 transition-all shadow-button disabled:opacity-40 min-h-[44px] min-w-[44px]"
          >
            <Check className="w-6 h-6 stroke-[2.2]" />
          </button>
          <span className="text-[10px] text-ink-muted flex items-center gap-0.5">
            Like <ArrowRight className="w-2.5 h-2.5" />
          </span>
        </div>
      </div>
    </div>
  );
}
