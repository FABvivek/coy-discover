import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  Profile,
  InternalProfile,
  SwipeDirection,
  SwipeResponse,
  MatchRecord,
} from './types';
import { sanitizeProfile, isMatch } from './matching';

const DB_DIR = path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DB_DIR, 'coy.db');

let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  if (dbInstance) {
    return dbInstance;
  }

  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  dbInstance = new Database(DB_PATH);
  dbInstance.pragma('journal_mode = WAL');
  dbInstance.pragma('foreign_keys = ON');

  initSchema(dbInstance);

  return dbInstance;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      city TEXT NOT NULL,
      interests TEXT NOT NULL,
      liked_user INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS swipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      direction TEXT NOT NULL CHECK(direction IN ('like', 'pass')),
      created_at TEXT NOT NULL,
      UNIQUE(user_id, target_id)
    );

    CREATE TABLE IF NOT EXISTS matches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      target_id TEXT NOT NULL,
      matched_at TEXT NOT NULL,
      UNIQUE(user_id, target_id)
    );

    CREATE TABLE IF NOT EXISTS user_account (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER NOT NULL,
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      city TEXT NOT NULL
    );
  `);
}

/**
 * Returns the logged-in user profile ('me') for the Match modal display
 */
export function getCurrentUser(): { id: string; name: string; age: number; photo: string; city: string } {
  const db = getDb();
  const row = db.prepare('SELECT * FROM user_account WHERE id = ?').get('me') as any;

  if (row) {
    return {
      id: row.id,
      name: row.name,
      age: row.age,
      photo: row.photo,
      city: row.city,
    };
  }

  // Fallback if not seeded yet
  return {
    id: 'me',
    name: 'You',
    age: 23,
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    city: 'New York, NY',
  };
}

/**
 * GET /api/feed: returns profiles the user has not swiped on yet.
 * STRICT PRIVACY:
 * 1. Excludes liked_user from the select entirely.
 * 2. Uses ORDER BY RANDOM() so server-side order is unpredictable and gives no clue.
 * 3. Sanitizes profiles using pure sanitizeProfile.
 */
export function getFeed(userId: string = 'me'): Profile[] {
  const db = getDb();

  // Select only public columns, exclude swiped profiles, and randomly shuffle
  const stmt = db.prepare(`
    SELECT id, name, age, photo, bio, city, interests
    FROM profiles
    WHERE id NOT IN (
      SELECT target_id FROM swipes WHERE user_id = ?
    )
    ORDER BY RANDOM()
  `);

  const rows = stmt.all(userId) as Array<{
    id: string;
    name: string;
    age: number;
    photo: string;
    bio: string;
    city: string;
    interests: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    city: row.city,
    interests: JSON.parse(row.interests || '[]'),
  }));
}

/**
 * Internal lookup: fetches target profile with liked_user status.
 * Used exclusively server-side for match evaluation.
 */
export function getInternalProfile(targetId: string): InternalProfile | null {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE id = ?').get(targetId) as any;

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    city: row.city,
    interests: JSON.parse(row.interests || '[]'),
    likedUser: row.liked_user === 1,
    createdAt: row.created_at,
  };
}

/**
 * POST /api/swipe: records swipe and determines mutual match.
 * Idempotent: repeated swipes on the same profile are safe and do not create duplicate matches.
 */
export function recordSwipe(
  userId: string = 'me',
  targetId: string,
  direction: SwipeDirection
): { status: 'ok' | 'not_found'; result?: SwipeResponse } {
  const db = getDb();
  const target = getInternalProfile(targetId);

  if (!target) {
    return { status: 'not_found' };
  }

  // Check if already swiped
  const existingSwipe = db
    .prepare('SELECT * FROM swipes WHERE user_id = ? AND target_id = ?')
    .get(userId, targetId) as any;

  if (existingSwipe) {
    // Idempotent: already recorded. Check if it was already a match
    const existingMatch = db
      .prepare('SELECT * FROM matches WHERE user_id = ? AND target_id = ?')
      .get(userId, targetId);

    return {
      status: 'ok',
      result: {
        match: Boolean(existingMatch),
        profile: existingMatch ? sanitizeProfile(target) : undefined,
      },
    };
  }

  const transaction = db.transaction(() => {
    const now = new Date().toISOString();

    // Insert swipe record
    db.prepare(`
      INSERT INTO swipes (user_id, target_id, direction, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, targetId, direction, now);

    // Evaluate match: ONLY if user likes AND target liked user
    const matched = isMatch(direction, target.likedUser);

    if (matched) {
      db.prepare(`
        INSERT OR IGNORE INTO matches (user_id, target_id, matched_at)
        VALUES (?, ?, ?)
      `).run(userId, targetId, now);

      return {
        match: true,
        profile: sanitizeProfile(target),
      };
    }

    return {
      match: false,
    };
  });

  const matchResult = transaction();

  return {
    status: 'ok',
    result: matchResult,
  };
}

/**
 * GET /api/matches: returns all mutual matches with target profile details.
 */
export function getMatches(userId: string = 'me'): (Profile & { matchedAt: string })[] {
  const db = getDb();

  const stmt = db.prepare(`
    SELECT p.id, p.name, p.age, p.photo, p.bio, p.city, p.interests, m.matched_at as matchedAt
    FROM matches m
    JOIN profiles p ON m.target_id = p.id
    WHERE m.user_id = ?
    ORDER BY m.matched_at DESC
  `);

  const rows = stmt.all(userId) as any[];

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    photo: row.photo,
    bio: row.bio,
    city: row.city,
    interests: JSON.parse(row.interests || '[]'),
    matchedAt: row.matchedAt,
  }));
}

/**
 * POST /api/reset: clears swipes and matches for the logged-in user.
 */
export function resetDemoData(userId: string = 'me'): void {
  const db = getDb();
  db.transaction(() => {
    db.prepare('DELETE FROM swipes WHERE user_id = ?').run(userId);
    db.prepare('DELETE FROM matches WHERE user_id = ?').run(userId);
  })();
}
