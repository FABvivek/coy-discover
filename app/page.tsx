'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TabBar } from '@/components/TabBar';
import { DiscoverHeader } from '@/components/DiscoverHeader';
import { CardStack } from '@/components/CardStack';
import { MatchesList } from '@/components/MatchesList';
import { MatchModal } from '@/components/MatchModal';
import { HomeView } from '@/components/HomeView';
import { FilterModal } from '@/components/FilterModal';
import {
  Profile,
  SwipeDirection,
  SwipeResponse,
  FeedFilterOptions,
  CurrentUser,
  Gender,
  LookingFor,
} from '@/lib/types';

export default function CoyDiscoverApp() {
  const [activeTab, setActiveTab] = useState<'home' | 'discover'>('discover');
  const [activeDiscoverView, setActiveDiscoverView] = useState<'swipe' | 'matches'>('swipe');

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [matches, setMatches] = useState<(Profile & { matchedAt: string })[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    id: 'me',
    name: 'Arjun Mehta',
    age: 23,
    gender: 'male',
    lookingFor: 'female',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    city: 'Indiranagar, Bangalore',
    bio: 'industrial design student & 35mm film photographer.',
  });

  // Filter state
  const [filters, setFilters] = useState<FeedFilterOptions>({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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

  const fetchFeed = useCallback(async (activeFilters: FeedFilterOptions = filters) => {
    setIsLoadingFeed(true);
    setFeedError(null);
    try {
      const params = new URLSearchParams();
      if (activeFilters.gender) params.set('gender', activeFilters.gender);
      if (activeFilters.city) params.set('city', activeFilters.city);

      const url = `/api/feed${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
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
  }, [filters]);

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

  // Update gender & orientation preferences
  const handleUpdateUserPreferences = async (gender: Gender, lookingFor: LookingFor) => {
    try {
      const res = await fetch('/api/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gender, lookingFor }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.error('Failed to update preferences', err);
    }
  };

  const handleApplyFilters = (newFilters: FeedFilterOptions) => {
    setFilters(newFilters);
    fetchFeed(newFilters);
  };

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

  const activeFiltersCount =
    (filters.gender && filters.gender !== 'all' ? 1 : 0) +
    (filters.city ? 1 : 0);

  return (
    <div className="min-h-screen bg-bg-primary text-ink-primary flex flex-col font-sans transition-colors duration-200">
      {/* Tab 1: Home View */}
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
            onOpenFilters={() => setIsFilterOpen(true)}
            activeFiltersCount={activeFiltersCount}
          />

          <div className="flex-1 flex flex-col">
            {activeDiscoverView === 'swipe' ? (
              <CardStack
                profiles={profiles}
                onSwipe={handleSwipe}
                isLoading={isLoadingFeed}
                error={feedError}
                onRetry={() => fetchFeed()}
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

      {/* Preferences & Demographic Filters Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        userGender={currentUser.gender}
        userLookingFor={currentUser.lookingFor}
        onUpdateUserGender={handleUpdateUserPreferences}
        filters={filters}
        onUpdateFilters={handleApplyFilters}
      />
    </div>
  );
}
