import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  Profile,
  InternalProfile,
  SwipeDirection,
  SwipeResponse,
  FeedFilterOptions,
  CurrentUser,
  Gender,
  LookingFor,
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
      gender TEXT NOT NULL DEFAULT 'female',
      height TEXT NOT NULL DEFAULT '5''6"',
      style_color TEXT NOT NULL DEFAULT 'Warm Earth',
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
      gender TEXT NOT NULL DEFAULT 'male',
      looking_for TEXT NOT NULL DEFAULT 'female',
      photo TEXT NOT NULL,
      bio TEXT NOT NULL,
      city TEXT NOT NULL
    );
  `);

  // Migration checks for existing databases
  try {
    const profileCols = db.prepare("PRAGMA table_info(profiles)").all() as any[];
    const colNames = profileCols.map(c => c.name);
    if (!colNames.includes('gender')) {
      db.exec("ALTER TABLE profiles ADD COLUMN gender TEXT NOT NULL DEFAULT 'female'");
    }
    if (!colNames.includes('height')) {
      db.exec("ALTER TABLE profiles ADD COLUMN height TEXT NOT NULL DEFAULT '5''6\"'");
    }
    if (!colNames.includes('style_color')) {
      db.exec("ALTER TABLE profiles ADD COLUMN style_color TEXT NOT NULL DEFAULT 'Warm Earth'");
    }

    const userCols = db.prepare("PRAGMA table_info(user_account)").all() as any[];
    const userColNames = userCols.map(c => c.name);
    if (!userColNames.includes('gender')) {
      db.exec("ALTER TABLE user_account ADD COLUMN gender TEXT NOT NULL DEFAULT 'male'");
    }
    if (!userColNames.includes('looking_for')) {
      db.exec("ALTER TABLE user_account ADD COLUMN looking_for TEXT NOT NULL DEFAULT 'female'");
    }
  } catch {}
}

/**
 * Returns the logged-in user profile ('me')
 */
export function getCurrentUser(userId: string = 'me'): CurrentUser {
  const db = getDb();
  const row = db.prepare('SELECT * FROM user_account WHERE id = ?').get(userId) as any;

  if (row) {
    return {
      id: row.id,
      name: row.name,
      age: row.age,
      gender: (row.gender || 'male') as Gender,
      lookingFor: (row.looking_for || 'female') as LookingFor,
      photo: row.photo,
      city: row.city,
      bio: row.bio,
    };
  }

  // Fallback if not seeded yet
  return {
    id: 'me',
    name: 'Arjun Mehta',
    age: 23,
    gender: 'male',
    lookingFor: 'female',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    city: 'Indiranagar, Bangalore',
    bio: 'industrial design & film photography. church street bookstores and specialty coffee.',
  };
}

/**
 * Updates the user's gender or discovery preferences
 */
export function updateUserPreferences(
  userId: string = 'me',
  updates: { gender?: Gender; lookingFor?: LookingFor }
): CurrentUser {
  const db = getDb();
  const current = getCurrentUser(userId);

  const newGender = updates.gender || current.gender;
  const newLookingFor = updates.lookingFor || current.lookingFor;

  db.prepare(`
    INSERT INTO user_account (id, name, age, gender, looking_for, photo, bio, city)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      gender = excluded.gender,
      looking_for = excluded.looking_for
  `).run(
    current.id,
    current.name,
    current.age,
    newGender,
    newLookingFor,
    current.photo,
    current.bio,
    current.city
  );

  return getCurrentUser(userId);
}

/**
 * GET /api/feed: returns profiles the user has not swiped on yet.
 * Supports gender preference (male sees female, female sees male, or everyone),
 * location filters, height, and style palette.
 * STRICT PRIVACY:
 * 1. Excludes liked_user from the select entirely.
 * 2. Uses ORDER BY RANDOM() so server-side order is unpredictable and gives no clue.
 * 3. Sanitizes profiles using pure sanitizeProfile.
 */
export function getFeed(userId: string = 'me', filters?: FeedFilterOptions): Profile[] {
  const db = getDb();
  const currentUser = getCurrentUser(userId);

  // Determine gender filter
  let targetGender: string | null = null;
  if (filters?.gender && filters.gender !== 'all') {
    targetGender = filters.gender;
  } else if (!filters?.gender) {
    if (currentUser.lookingFor === 'female') {
      targetGender = 'female';
    } else if (currentUser.lookingFor === 'male') {
      targetGender = 'male';
    }
  }

  const queryConditions: string[] = [
    'id NOT IN (SELECT target_id FROM swipes WHERE user_id = ?)',
  ];
  const params: any[] = [userId];

  if (targetGender) {
    queryConditions.push('gender = ?');
    params.push(targetGender);
  }

  if (filters?.city && filters.city !== 'all') {
    queryConditions.push('city LIKE ?');
    params.push(`%${filters.city}%`);
  }

  if (filters?.styleColor && filters.styleColor !== 'all') {
    queryConditions.push('style_color = ?');
    params.push(filters.styleColor);
  }

  const sql = `
    SELECT id, name, age, gender, height, style_color, photo, bio, city, interests
    FROM profiles
    WHERE ${queryConditions.join(' AND ')}
    ORDER BY RANDOM()
  `;

  const rows = db.prepare(sql).all(...params) as Array<{
    id: string;
    name: string;
    age: number;
    gender: string;
    height: string;
    style_color: string;
    photo: string;
    bio: string;
    city: string;
    interests: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    age: row.age,
    gender: row.gender as Gender,
    height: row.height,
    styleColor: row.style_color,
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
    gender: row.gender || 'female',
    height: row.height || '5\'6"',
    styleColor: row.style_color || 'Warm Earth',
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

    db.prepare(`
      INSERT INTO swipes (user_id, target_id, direction, created_at)
      VALUES (?, ?, ?, ?)
    `).run(userId, targetId, direction, now);

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
    SELECT p.id, p.name, p.age, p.gender, p.height, p.style_color as styleColor, p.photo, p.bio, p.city, p.interests, m.matched_at as matchedAt
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
    gender: row.gender,
    height: row.height,
    styleColor: row.styleColor,
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
