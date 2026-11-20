'use client';

import React from 'react';
import { Compass } from 'lucide-react';

interface HomeViewProps {
  onGoToDiscover: () => void;
}

export function HomeView({ onGoToDiscover }: HomeViewProps) {
  return (
    <div className="w-full max-w-md mx-auto min-h-[calc(100vh-64px)] flex flex-col justify-between px-6 pt-16 pb-24 text-center">
      {/* Top subtle wordmark */}
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-2">
          <span className="font-serif text-3xl font-normal tracking-tight text-ink-primary">
            coy
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-accent mb-1 opacity-80" />
        </div>
      </div>

      {/* Intentionally quiet, editorial home screen */}
      <div className="flex flex-col items-center my-auto max-w-xs mx-auto">
        <h1 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-ink-primary leading-snug mb-3">
          Find out if your crush likes you back.
        </h1>
        <p className="text-sm text-ink-secondary leading-relaxed mb-8 font-light">
          If they don&apos;t, nobody ever knows. That&apos;s our promise.
        </p>

        <button
          type="button"
          onClick={onGoToDiscover}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-ink-primary text-bg-primary text-sm font-medium hover:opacity-90 active:scale-95 transition-all min-h-[44px] shadow-sm"
        >
          <Compass className="w-4 h-4 stroke-[1.75]" />
          <span>Start discovering</span>
        </button>
      </div>

      {/* Discreet footer text */}
      <div className="text-[11px] text-ink-muted tracking-wide">
        Discreet &bull; Calm &bull; Private
      </div>
    </div>
  );
}
