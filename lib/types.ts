export interface Profile {
  id: string;
  name: string;
  age: number;
  photo: string;
  bio: string;
  city: string;
  interests: string[];
}

export interface InternalProfile extends Profile {
  likedUser: boolean; // Server-side ONLY: never exposed in /api/feed or /api/swipe (unless mutual)
  createdAt: string;
}

export type SwipeDirection = 'like' | 'pass';

export interface SwipeRecord {
  id?: number;
  userId: string;
  targetId: string;
  direction: SwipeDirection;
  createdAt: string;
}

export interface MatchRecord {
  id?: number;
  userId: string;
  targetId: string;
  matchedAt: string;
  profile?: Profile;
}

export interface SwipeResponse {
  match: boolean;
  profile?: Profile;
}
