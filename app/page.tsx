'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TabBar } from '@/components/TabBar';
import { DiscoverHeader } from '@/components/DiscoverHeader';
import { CardStack } from '@/components/CardStack';
import { MatchesList } from '@/components/MatchesList';
import { MatchModal } from '@/components/MatchModal';
import { HomeView } from '@/components/HomeView';
import { Profile, SwipeDirection, SwipeResponse } from '@/lib/types';

export default function CoyDiscoverApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover'>('discover');
  const [activeDiscoverView, setActiveDiscoverView] = useState<'swipe' | 'matches'>('swipe');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<(Profile & { matchedAt: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    photo: string;
  }>({
    id: 'me',
    name: 'Arjun',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
  });

  const [isLoadingFeed, setIsLoadingFeed] = useState(true);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Match celebration state
  const [matchModalState, setMatchModalState] = useState<{
    isOpen: boolean;
    profile: Profile | null;
  }>({
    isOpen: false,
    profile: null,
  });

  // Dark mode state
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference or localStorage
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const fetchFeed = useCallback(async () => {
    setIsLoadingFeed(true);
    setFeedError(null);
    try {
      const res = await fetch('/api/feed');
      if (!res.ok) {
        throw new Error(`Failed to load feed (${res.status})`);
      }
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch (err: any) {
      setFeedError(err?.message || 'Could not connect to Coy discovery');
    } finally {
      setIsLoadingFeed(false);
    }
  }, []);

  const fetchMatches = useCallback(async () => {
    setIsLoadingMatches(true);
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch {
      // Quiet fail
    } finally {
      setIsLoadingMatches(false);
    }
  }, []);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch {
      // fallback preserved
    }
  }, []);

  // Initial data load
  useEffect(() => {
    fetchFeed();
    fetchMatches();
    fetchCurrentUser();
  }, [fetchFeed, fetchMatches, fetchCurrentUser]);

  // Handle Swipe action
  const handleSwipe = async (profileId: string, direction: SwipeDirection) => {
    try {
      const res = await fetch('/api/swipe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileId, direction }),
      });

      if (!res.ok) {
        console.error('Swipe error', res.status);
        return;
      }

      const result: SwipeResponse = await res.json();

      // If mutual match occurred, show MatchModal and refresh matches list
      if (result.match && result.profile) {
        setMatchModalState({
          isOpen: true,
          profile: result.profile,
        });
        fetchMatches();
      }
    } catch (err) {
      console.error('Failed to submit swipe', err);
    }
  };

  // Reset demo data
  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        await Promise.all([fetchFeed(), fetchMatches()]);
      }
    } catch (err) {
      console.error('Failed to reset demo data', err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary text-ink-primary flex flex-col font-sans transition-colors duration-200">
      {/* Tab 1: Home View (Intentionally blank & calm) */}
      {activeTab === 'home' && (
        <main className="flex-1 flex flex-col">
          <HomeView onGoToDiscover={() => setActiveTab('discover')} />
        </main>
      )}

      {/* Tab 2: Discover View */}
      {activeTab === 'discover' && (
        <main className="flex-1 flex flex-col pb-20">
          <DiscoverHeader
            activeView={activeDiscoverView}
            onViewChange={setActiveDiscoverView}
            matchesCount={matches.length}
            onReset={handleResetDemo}
            isResetting={isResetting}
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />

          <div className="flex-1 flex flex-col">
            {activeDiscoverView === 'swipe' ? (
              <CardStack
                profiles={profiles}
                onSwipe={handleSwipe}
                isLoading={isLoadingFeed}
                error={feedError}
                onRetry={fetchFeed}
                onResetDemo={handleResetDemo}
                isResetting={isResetting}
              />
            ) : (
              <MatchesList
                matches={matches}
                isLoading={isLoadingMatches}
                onExploreMore={() => setActiveDiscoverView('swipe')}
              />
            )}
          </div>
        </main>
      )}

      {/* Persistent Bottom Tab Bar */}
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        matchesCount={matches.length}
      />

      {/* Restrained "It's a match!" Modal */}
      <MatchModal
        isOpen={matchModalState.isOpen}
        matchedProfile={matchModalState.profile}
        currentUserPhoto={currentUser.photo}
        onKeepSwiping={() => setMatchModalState({ isOpen: false, profile: null })}
        onViewMatches={() => {
          setMatchModalState({ isOpen: false, profile: null });
          setActiveTab('discover');
          setActiveDiscoverView('matches');
        }}
      />
    </div>
  );
}
