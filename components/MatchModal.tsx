'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Profile } from '@/lib/types';

interface MatchModalProps {
  matchedProfile: Profile | null;
  currentUserPhoto: string;
  isOpen: boolean;
  onKeepSwiping: () => void;
  onViewMatches: () => void;
}

export function MatchModal({
  matchedProfile,
  currentUserPhoto,
  isOpen,
  onKeepSwiping,
  onViewMatches,
}: MatchModalProps) {
  const shouldReduceMotion = useReducedMotion();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onKeepSwiping();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onKeepSwiping]);

  if (!isOpen || !matchedProfile) return null;

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.94, y: shouldReduceMotion ? 0 : 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.96 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-sm rounded-[32px] bg-bg-card border border-line shadow-card-elevated overflow-hidden p-8 flex flex-col items-center text-center"
        >
          {/* Subtle top indicator */}
          <div className="w-8 h-1 rounded-full bg-line-muted mb-6" />

          {/* Two elegant photos side-by-side with slight overlap */}
          <div className="relative flex items-center justify-center -space-x-4 mb-6">
            {/* User photo */}
            <div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-bg-card shadow-card transform -rotate-3 z-0">
              <img
                src={currentUserPhoto}
                alt="Your photo"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Matched profile photo */}
            <div className="relative w-24 h-32 rounded-2xl overflow-hidden border-2 border-bg-card shadow-card transform rotate-3 z-10">
              <img
                src={matchedProfile.photo}
                alt={matchedProfile.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Editorial Headline */}
          <h2
            id="match-modal-title"
            className="font-serif text-3xl font-medium tracking-tight text-ink-primary mb-2"
          >
            It&apos;s a match.
          </h2>

          {/* Discreet, calm human copy */}
          <p className="text-sm text-ink-secondary leading-relaxed mb-8 max-w-[260px]">
            You and {matchedProfile.name} both liked each other. Nobody else knows.
          </p>

          {/* Two clear action buttons */}
          <div className="w-full flex flex-col gap-3">
            <button
              type="button"
              onClick={onViewMatches}
              className="w-full py-3.5 px-5 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover active:scale-[0.98] transition-all min-h-[44px] shadow-sm"
            >
              View matches
            </button>

            <button
              type="button"
              onClick={onKeepSwiping}
              className="w-full py-3.5 px-5 rounded-full bg-bg-secondary text-ink-primary text-sm font-medium hover:bg-bg-hover active:scale-[0.98] transition-all min-h-[44px]"
            >
              Keep swiping
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
