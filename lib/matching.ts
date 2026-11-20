import { Profile, InternalProfile, SwipeDirection, SwipeRecord } from './types';

/**
 * Pure privacy sanitizer: strips all internal / server-only flags.
 * Guarantees that client-facing profiles NEVER leak `likedUser`.
 */
export function sanitizeProfile(profile: InternalProfile): Profile {
  const { id, name, age, photo, bio, city, interests } = profile;
  return {
    id,
    name,
    age,
    photo,
    bio,
    city,
    interests: [...interests],
  };
}

/**
 * Determines whether a swipe creates a match.
 * Core rule: A match happens ONLY when the user likes someone who already liked them.
 * If user passes, it never matches, and the target's like status is never revealed.
 */
export function isMatch(direction: SwipeDirection, targetLikedUser: boolean): boolean {
  if (direction !== 'like') {
    return false;
  }
  return targetLikedUser === true;
}

/**
 * Fisher-Yates array shuffle.
 * Accepts an optional random generator function for deterministic testing.
 */
export function shuffleArray<T>(array: T[], rng: () => number = Math.random): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Filters the feed for unswiped profiles, sanitizes them so no private flags are exposed,
 * and shuffles them so liked-me profiles are not grouped or predictable.
 */
export function filterAndSanitizeFeed(
  profiles: InternalProfile[],
  swipedTargetIds: Set<string> | string[],
  rng: () => number = Math.random
): Profile[] {
  const swipedSet = swipedTargetIds instanceof Set ? swipedTargetIds : new Set(swipedTargetIds);

  const available = profiles.filter((p) => !swipedSet.has(p.id));
  const sanitized = available.map(sanitizeProfile);

  return shuffleArray(sanitized, rng);
}

/**
 * Pure swipe recorder with idempotency.
 * If a swipe for (userId, targetId) already exists, it is not duplicated.
 */
export function recordSwipePure(
  existingSwipes: SwipeRecord[],
  newSwipe: { userId: string; targetId: string; direction: SwipeDirection; createdAt?: string }
): {
  updatedSwipes: SwipeRecord[];
  isNew: boolean;
  existingRecord?: SwipeRecord;
} {
  const existing = existingSwipes.find(
    (s) => s.userId === newSwipe.userId && s.targetId === newSwipe.targetId
  );

  if (existing) {
    return {
      updatedSwipes: existingSwipes,
      isNew: false,
      existingRecord: existing,
    };
  }

  const record: SwipeRecord = {
    userId: newSwipe.userId,
    targetId: newSwipe.targetId,
    direction: newSwipe.direction,
    createdAt: newSwipe.createdAt || new Date().toISOString(),
  };

  return {
    updatedSwipes: [...existingSwipes, record],
    isNew: true,
  };
}

/**
 * Evaluates the swipe action and returns the matching response.
 * Profile is included in response ONLY when match is true.
 */
export function evaluateSwipe({
  direction,
  targetProfile,
  alreadySwiped = false,
}: {
  direction: SwipeDirection;
  targetProfile: InternalProfile;
  alreadySwiped?: boolean;
}): {
  match: boolean;
  matchedProfile?: Profile;
} {
  // If already swiped previously, swipe is idempotent and should not trigger a new match
  if (alreadySwiped) {
    return { match: false };
  }

  const match = isMatch(direction, targetProfile.likedUser);

  if (match) {
    return {
      match: true,
      matchedProfile: sanitizeProfile(targetProfile),
    };
  }

  return {
    match: false,
  };
}
