'use client';

import React, { useState } from 'react';
import { MapPin, MessageCircle, HeartHandshake, X } from 'lucide-react';
import { Profile } from '@/lib/types';

interface MatchItem extends Profile {
  matchedAt: string;
}

interface MatchesListProps {
  matches: MatchItem[];
  isLoading: boolean;
  onExploreMore: () => void;
}

export function MatchesList({ matches, isLoading, onExploreMore }: MatchesListProps) {
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null);

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
            onClick={() => setSelectedMatch(match)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setSelectedMatch(match);
              }
            }}
            aria-label={`View match details for ${match.name}`}
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-bg-card border border-line shadow-card cursor-pointer hover:shadow-card-elevated hover:border-ink-secondary/30 transition-all focus-visible:outline-accent"
          >
            <img
              src={match.photo}
              alt={match.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

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
            </div>
          </div>
        ))}
      </div>

      {/* Detail drawer/modal when tapping a match */}
      {selectedMatch && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedMatch(null)}
        >
          <div
            className="w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] bg-bg-card border border-line p-6 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-line">
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-medium text-ink-primary">
                  {selectedMatch.name}, {selectedMatch.age}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                aria-label="Close match details"
                className="p-2 rounded-full hover:bg-bg-secondary text-ink-secondary hover:text-ink-primary min-w-[36px] min-h-[36px] flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mt-4 border border-line">
              <img
                src={selectedMatch.photo}
                alt={selectedMatch.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs text-ink-secondary mt-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>{selectedMatch.city}</span>
            </div>

            <p className="text-sm text-ink-primary leading-relaxed mt-3">
              {selectedMatch.bio}
            </p>

            {selectedMatch.interests && selectedMatch.interests.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {selectedMatch.interests.map((interest, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-bg-secondary text-ink-secondary border border-line"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-line flex items-center justify-between text-xs text-ink-muted">
              <span>Mutual match</span>
              <span>
                {selectedMatch.matchedAt
                  ? new Date(selectedMatch.matchedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
