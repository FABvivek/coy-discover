import { describe, it, expect } from 'vitest';
import {
  isMatch,
  sanitizeProfile,
  filterAndSanitizeFeed,
  recordSwipePure,
  evaluateSwipe,
} from '../lib/matching';
import { InternalProfile, SwipeRecord } from '../lib/types';

const mockProfiles: InternalProfile[] = [
  {
    id: 'user_1',
    name: 'Maya',
    age: 22,
    photo: 'https://example.com/maya.jpg',
    bio: 'architecture & bakeries',
    city: 'Brooklyn, NY',
    interests: ['Architecture', 'Ceramics', 'Matcha'],
    likedUser: true, // liked the user
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_2',
    name: 'Leo',
    age: 24,
    photo: 'https://example.com/leo.jpg',
    bio: 'film photography & jazz',
    city: 'Lower East Side, NY',
    interests: ['35mm Film', 'Jazz', 'Bouldering'],
    likedUser: false, // did NOT like the user
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user_3',
    name: 'Sora',
    age: 21,
    photo: 'https://example.com/sora.jpg',
    bio: 'printmaking & darkroom',
    city: 'Providence, RI',
    interests: ['Printmaking', 'Graphic Design', 'Tea'],
    likedUser: true, // liked the user
    createdAt: '2026-01-01T00:00:00Z',
  },
];

describe('Matching Logic & Privacy Guarantees', () => {
  it('creates a match when user likes someone who already liked them (like + liked-me)', () => {
    const result = evaluateSwipe({
      direction: 'like',
      targetProfile: mockProfiles[0], // likedUser: true
    });

    expect(result.match).toBe(true);
    expect(result.matchedProfile).toBeDefined();
    expect(result.matchedProfile?.id).toBe('user_1');
    expect(result.matchedProfile?.name).toBe('Maya');
  });

  it('does NOT create a match when user likes someone who did NOT like them (like + not-liked-me)', () => {
    const result = evaluateSwipe({
      direction: 'like',
      targetProfile: mockProfiles[1], // likedUser: false
    });

    expect(result.match).toBe(false);
    expect(result.matchedProfile).toBeUndefined();
  });

  it('NEVER creates a match when user passes, even if the target liked the user', () => {
    // Target liked user, but user passed
    const resultLiked = evaluateSwipe({
      direction: 'pass',
      targetProfile: mockProfiles[0], // likedUser: true
    });
    expect(resultLiked.match).toBe(false);
    expect(resultLiked.matchedProfile).toBeUndefined();

    // Target didn't like user, and user passed
    const resultNotLiked = evaluateSwipe({
      direction: 'pass',
      targetProfile: mockProfiles[1], // likedUser: false
    });
    expect(resultNotLiked.match).toBe(false);
    expect(resultNotLiked.matchedProfile).toBeUndefined();
  });

  it('isMatch helper follows exact mutual liking rules', () => {
    expect(isMatch('like', true)).toBe(true);
    expect(isMatch('like', false)).toBe(false);
    expect(isMatch('pass', true)).toBe(false);
    expect(isMatch('pass', false)).toBe(false);
  });

  it('repeat swipe is idempotent and does not create duplicate records or match events', () => {
    const initialSwipes: SwipeRecord[] = [];

    // First swipe: like user_1
    const firstResult = recordSwipePure(initialSwipes, {
      userId: 'me',
      targetId: 'user_1',
      direction: 'like',
    });

    expect(firstResult.isNew).toBe(true);
    expect(firstResult.updatedSwipes).toHaveLength(1);

    // Second swipe: repeat like user_1
    const secondResult = recordSwipePure(firstResult.updatedSwipes, {
      userId: 'me',
      targetId: 'user_1',
      direction: 'like',
    });

    expect(secondResult.isNew).toBe(false);
    expect(secondResult.updatedSwipes).toHaveLength(1);
    expect(secondResult.existingRecord?.direction).toBe('like');

    // Evaluating swipe with alreadySwiped=true returns match: false
    const evalRepeat = evaluateSwipe({
      direction: 'like',
      targetProfile: mockProfiles[0],
      alreadySwiped: true,
    });
    expect(evalRepeat.match).toBe(false);
  });

  it('feed excludes swiped profiles', () => {
    const swipedIds = new Set(['user_1']);
    const feed = filterAndSanitizeFeed(mockProfiles, swipedIds);

    const ids = feed.map((p) => p.id);
    expect(ids).not.toContain('user_1');
    expect(ids).toContain('user_2');
    expect(ids).toContain('user_3');
    expect(feed).toHaveLength(2);
  });

  it('feed NEVER includes the likedUser (or likedMe) private field on any profile', () => {
    const feed = filterAndSanitizeFeed(mockProfiles, new Set());

    expect(feed.length).toBe(3);
    for (const profile of feed) {
      expect((profile as any).likedUser).toBeUndefined();
      expect((profile as any).likedMe).toBeUndefined();
      expect((profile as any).createdAt).toBeUndefined();
      // Ensure all public fields are intact
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.age).toBeGreaterThan(0);
      expect(profile.photo).toBeDefined();
      expect(profile.bio).toBeDefined();
      expect(profile.city).toBeDefined();
      expect(Array.isArray(profile.interests)).toBe(true);
    }
  });

  it('sanitizeProfile strictly extracts only public fields', () => {
    const sanitized = sanitizeProfile(mockProfiles[0]);

    expect((sanitized as any).likedUser).toBeUndefined();
    expect((sanitized as any).likedMe).toBeUndefined();
    expect((sanitized as any).createdAt).toBeUndefined();
    expect(Object.keys(sanitized).sort()).toEqual([
      'age',
      'bio',
      'city',
      'id',
      'interests',
      'name',
      'photo',
    ]);
  });
});
