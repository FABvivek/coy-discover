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
  updateUserPreferences,
  getInternalProfile,
  getMessages,
  saveMessage,
} from '../lib/db';

describe('Database Layer & Privacy Guarantees', () => {
  beforeEach(() => {
    const db = getDb();
    db.prepare('DELETE FROM matches').run();
    db.prepare('DELETE FROM swipes').run();
    db.prepare('DELETE FROM profiles').run();
    db.prepare('DELETE FROM user_account').run();
    db.prepare('DELETE FROM messages').run();

    // Insert user: Arjun (Male, looking for everyone initially in test)
    db.prepare(`
      INSERT INTO user_account (id, name, age, gender, looking_for, photo, bio, city)
      VALUES ('me', 'Arjun', 23, 'male', 'everyone', 'https://example.com/me.jpg', 'architecture & books', 'Indiranagar, Bangalore')
    `).run();

    // Insert test profiles
    // profile_1: female, liked user
    db.prepare(`
      INSERT INTO profiles (id, name, age, gender, height, style_color, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_1', 'Ananya', 22, 'female', '5''5"', 'Warm Terracotta', 'https://example.com/ananya.jpg', 'nift grad', 'Delhi', '["Textiles","Chai"]', 1, datetime('now'))
    `).run();

    // profile_2: male, did not like user
    db.prepare(`
      INSERT INTO profiles (id, name, age, gender, height, style_color, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_2', 'Kabir', 24, 'male', '5''11"', 'Indigo & Linen', 'https://example.com/kabir.jpg', 'theatre lighting', 'Bangalore', '["Theatre","Music"]', 0, datetime('now'))
    `).run();

    // profile_3: female, liked user
    db.prepare(`
      INSERT INTO profiles (id, name, age, gender, height, style_color, photo, bio, city, interests, liked_user, created_at)
      VALUES ('target_3', 'Riya', 21, 'female', '5''4"', 'Indigo & Linen', 'https://example.com/riya.jpg', 'fine arts', 'Mumbai', '["Art","Printmaking"]', 1, datetime('now'))
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
      expect(profile.gender).toBeDefined();
      expect(profile.height).toBeDefined();
      expect(Array.isArray(profile.interests)).toBe(true);
    }
  });

  it('getFeed filters by gender based on user preferences or query options', () => {
    // When looking for female only
    const femaleFeed = getFeed('me', { gender: 'female' });
    expect(femaleFeed.length).toBe(2);
    expect(femaleFeed.every((p) => p.gender === 'female')).toBe(true);

    // When looking for male only
    const maleFeed = getFeed('me', { gender: 'male' });
    expect(maleFeed.length).toBe(1);
    expect(maleFeed[0].id).toBe('target_2');
    expect(maleFeed[0].gender).toBe('male');
  });

  it('updateUserPreferences updates gender identity and discovery target', () => {
    const updated = updateUserPreferences('me', { gender: 'female', lookingFor: 'male' });
    expect(updated.gender).toBe('female');
    expect(updated.lookingFor).toBe('male');

    // Default feed now respects lookingFor = 'male'
    const feed = getFeed('me');
    expect(feed.length).toBe(1);
    expect(feed[0].gender).toBe('male');
  });

  it('like on someone who liked the user produces a mutual match', () => {
    const res = recordSwipe('me', 'target_1', 'like');

    expect(res.status).toBe('ok');
    expect(res.result?.match).toBe(true);
    expect(res.result?.profile).toBeDefined();
    expect(res.result?.profile?.id).toBe('target_1');
    expect(res.result?.profile?.name).toBe('Ananya');
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

  it('saves and retrieves messages for mutual matches', () => {
    saveMessage('target_1', 'me', 'Hey Ananya! Loved your bio :)');
    saveMessage('target_1', 'target_1', 'Hey Arjun! Would love to get chai!');

    const msgs = getMessages('target_1');
    expect(msgs.length).toBe(2);
    expect(msgs[0].senderId).toBe('me');
    expect(msgs[0].text).toBe('Hey Ananya! Loved your bio :)');
    expect(msgs[1].senderId).toBe('target_1');
    expect(msgs[1].text).toBe('Hey Arjun! Would love to get chai!');
  });

  it('resetDemoData clears swipes, matches, and messages', () => {
    recordSwipe('me', 'target_1', 'like');
    recordSwipe('me', 'target_2', 'pass');
    saveMessage('target_1', 'me', 'Hey!');
    expect(getFeed('me').length).toBe(1);
    expect(getMatches('me').length).toBe(1);
    expect(getMessages('target_1').length).toBe(1);

    resetDemoData('me');

    expect(getFeed('me').length).toBe(3);
    expect(getMatches('me').length).toBe(0);
    expect(getMessages('target_1').length).toBe(0);
  });
});
