'use client';

import React, { useState } from 'react';
import { MapPin, MessageCircle, HeartHandshake, Sparkles } from 'lucide-react';
import { Profile } from '@/lib/types';
import { ChatDrawer } from './ChatDrawer';

interface MatchItem extends Profile {
  matchedAt: string;
}

interface MatchesListProps {
  matches: MatchItem[];
  isLoading: boolean;
  onExploreMore: () => void;
}

export function MatchesList({ matches, isLoading, onExploreMore }: MatchesListProps) {
  const [activeChatMatch, setActiveChatMatch] = useState<MatchItem | null>(null);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-2xl bg-bg-secondary border border-line animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="w-full max-w-sm mx-auto flex flex-col items-center justify-center px-6 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-full bg-bg-secondary border border-line flex items-center justify-center text-ink-secondary mb-5">
          <HeartHandshake className="w-6 h-6 stroke-[1.5] opacity-60 text-ink-secondary" />
        </div>
        <h3 className="font-serif text-2xl font-normal text-ink-primary mb-2 tracking-tight">
          No matches yet
        </h3>
        <p className="text-sm text-ink-secondary mb-8 leading-relaxed max-w-xs">
          When someone you like likes you back, they&apos;ll appear here quietly. If they don&apos;t, nobody ever knows.
        </p>
        <button
          type="button"
          onClick={onExploreMore}
          className="px-6 py-3 rounded-full bg-ink-primary text-bg-primary text-sm font-medium hover:opacity-90 active:scale-95 transition-all min-h-[44px]"
        >
          Discover profiles
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto px-4 pt-2 pb-24">
      {/* Discreet subheader */}
      <div className="flex items-center justify-between mb-4 px-1">
        <span className="text-xs font-medium uppercase tracking-wider text-ink-muted">
          Mutual matches
        </span>
        <span className="text-xs text-ink-secondary">
          {matches.length} {matches.length === 1 ? 'connection' : 'connections'}
        </span>
      </div>

      {/* Grid of matches */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {matches.map((match) => (
          <div
            key={match.id}
            onClick={() => setActiveChatMatch(match)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setActiveChatMatch(match);
              }
            }}
            aria-label={`Open chat with ${match.name}`}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg-card border border-line shadow-card cursor-pointer hover:shadow-card-elevated hover:border-ink-secondary/30 transition-all focus-visible:outline-accent"
          >
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* Quick message badge on top right */}
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-3.5 text-white">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif text-lg font-medium tracking-tight">
                  {match.name}
                </span>
                <span className="text-sm font-light text-white/80">{match.age}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-white/70 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{match.city}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] text-white/90">
                <span>1-click message</span>
                <Sparkles className="w-2.5 h-2.5 text-accent" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive 1-on-1 Chat Drawer */}
      {activeChatMatch && (
        <ChatDrawer
          match={activeChatMatch}
          onClose={() => setActiveChatMatch(null)}
        />
      )}
    </div>
  );
}
