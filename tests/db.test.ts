import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const TEST_DB_PATH = path.join(process.cwd(), 'data', 'coy_test.db');
process.env.DATABASE_PATH = TEST_DB_PATH;

// Import db helpers after setting env var
import {
  getDb,
  getFeed,
  recordSwipe,
  getMatches,
  resetDemoData,
  getCurrentUser,
  getInternalProfile,
} from '../lib/db';

describe('Database Layer & Privacy Guarantees', () => {
  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM swipes').run();
    db.prepare('DELETE FROM profiles').run();
    db.prepare('DELETE FROM user_account').run();

    // Insert user
    db.prepare(`
      INSERT INTO user_account (id, name, age, photo, bio, city)
      VALUES ('me', 'Julian', 23, 'https://example.com/me.jpg', 'architecture & books', 'Brooklyn, NY')
    `).run();

    // Insert test profiles
    // profile_1: liked user
    db.prepare(`
      INSERT INTO profiles (id, name, age, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_1', 'Elena', 22, 'https://example.com/elena.jpg', 'industrial design', 'Brooklyn', '["Design","Coffee"]', 1, datetime('now'))
    `).run();

    // profile_2: did not like user
    db.prepare(`
      INSERT INTO profiles (id, name, age, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_2', 'Marcus', 24, 'https://example.com/marcus.jpg', 'ceramics', 'Brooklyn', '["Ceramics","Running"]', 0, datetime('now'))
    `).run();

    // profile_3: liked user
    db.prepare(`
      INSERT INTO profiles (id, name, age, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_3', 'Maya', 21, 'https://example.com/maya.jpg', 'printmaking', 'NY', '["Art","Printmaking"]', 1, datetime('now'))
    `).run();
  });

  afterAll(() => {
    try {
      if (fs.existsSync(TEST_DB_PATH)) {
        fs.unlinkSync(TEST_DB_PATH);
      }
    } catch {}
  });

  it('getFeed returns public profile data without revealing liked_user', () => {
    const feed = getFeed('me');
    expect(feed.length).toBe(3);

    for (const profile of feed) {
      expect((profile as any).liked_user).toBeUndefined();
      expect((profile as any).likedUser).toBeUndefined();
      expect((profile as any).likedMe).toBeUndefined();
      expect(profile.id).toBeDefined();
      expect(profile.name).toBeDefined();
      expect(profile.age).toBeDefined();
      expect(Array.isArray(profile.interests)).toBe(true);
    }
  });

  it('like on someone who liked the user produces a mutual match', () => {
    const res = recordSwipe('me', 'target_1', 'like');

    expect(res.status).toBe('ok');
    expect(res.result?.match).toBe(true);
    expect(res.result?.profile).toBeDefined();
    expect(res.result?.profile?.id).toBe('target_1');
    expect(res.result?.profile?.name).toBe('Elena');
    expect((res.result?.profile as any)?.likedUser).toBeUndefined();

    // Matches table now contains the match
    const matches = getMatches('me');
    expect(matches.length).toBe(1);
    expect(matches[0].id).toBe('target_1');
  });

  it('like on someone who did NOT like the user returns match=false and no profile', () => {
    const res = recordSwipe('me', 'target_2', 'like');

    expect(res.status).toBe('ok');
    expect(res.result?.match).toBe(false);
    expect(res.result?.profile).toBeUndefined();

    // Matches table remains empty
    const matches = getMatches('me');
    expect(matches.length).toBe(0);
  });

  it('pass never reveals whether the target liked the user', () => {
    // target_3 liked user, but user passes
    const res = recordSwipe('me', 'target_3', 'pass');

    expect(res.status).toBe('ok');
    expect(res.result?.match).toBe(false);
    expect(res.result?.profile).toBeUndefined();

    const matches = getMatches('me');
    expect(matches.length).toBe(0);
  });

  it('swiping a profile removes it from subsequent feed calls', () => {
    expect(getFeed('me').length).toBe(3);

    recordSwipe('me', 'target_1', 'like');

    const feedAfterOne = getFeed('me');
    expect(feedAfterOne.length).toBe(2);
    expect(feedAfterOne.map((p) => p.id)).not.toContain('target_1');

    recordSwipe('me', 'target_2', 'pass');

    const feedAfterTwo = getFeed('me');
    expect(feedAfterTwo.length).toBe(1);
    expect(feedAfterTwo[0].id).toBe('target_3');
  });

  it('repeated swipe on same profile is idempotent and safe', () => {
    const res1 = recordSwipe('me', 'target_1', 'like');
    expect(res1.result?.match).toBe(true);

    // Second swipe on same profile
    const res2 = recordSwipe('me', 'target_1', 'like');
    expect(res2.status).toBe('ok');

    // DB swipes table must only have 1 entry
    const db = getDb();
    const swipes = db.prepare('SELECT * FROM swipes WHERE user_id = ? AND target_id = ?').all('me', 'target_1');
    expect(swipes.length).toBe(1);

    const matches = db.prepare('SELECT * FROM matches WHERE user_id = ? AND target_id = ?').all('me', 'target_1');
    expect(matches.length).toBe(1);
  });

  it('recordSwipe returns not_found for non-existent profileId', () => {
    const res = recordSwipe('me', 'non_existent_id', 'like');
    expect(res.status).toBe('not_found');
  });

  it('resetDemoData clears swipes and matches so all profiles reappear in feed', () => {
    recordSwipe('me', 'target_1', 'like');
    recordSwipe('me', 'target_2', 'pass');
    expect(getFeed('me').length).toBe(1);
    expect(getMatches('me').length).toBe(1);

    resetDemoData('me');

    expect(getFeed('me').length).toBe(3);
    expect(getMatches('me').length).toBe(0);
  });
});
