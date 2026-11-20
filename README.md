# Coy Discover

> "Find out if your crush likes you back. If they don't, nobody ever knows."

**Coy Discover** is a calm, discreet, swipe-based discovery feature built as a standalone mobile-first application. Designed with quiet confidence, editorial typography, and uncompromising privacy guarantees, Coy ensures that a crush is only revealed when interest is strictly mutual.

---

## Table of Contents
1. [Core Privacy Architecture](#core-privacy-architecture)
2. [Design Decisions & Aesthetic Direction](#design-decisions--aesthetic-direction)
3. [Tech Stack](#tech-stack)
4. [Getting Started](#getting-started)
5. [Database & Seeding](#database--seeding)
6. [API Documentation](#api-documentation)
7. [Automated Testing](#automated-testing)
8. [Project Structure](#project-structure)

---

## Core Privacy Architecture

Privacy is the foundational rule of Coy:

1. **Strict Mutual Matching:**
   A match occurs **only** when both parties like each other. If User A likes User B, but User B passes (or has not yet swiped), nothing is revealed to User A or anyone else.

2. **No Data Leakage in Feed (`/api/feed`):**
   - The `/api/feed` endpoint strips all internal fields (`liked_user`, `likedMe`, etc.).
   - The query uses `ORDER BY RANDOM()` on SQLite so that the feed sequence is shuffled server-side. Profiles that have already liked the user are never grouped or ordered predictably.
   - Even inspecting network packets in Chrome DevTools reveals zero indicators regarding who has liked the logged-in user.

3. **No Leakage on Pass:**
   If the user passes on a profile that previously liked them, the target's like remains completely secret and unrevealed. The server records the swipe as a neutral pass and returns `{ match: false }`.

4. **Idempotent Actions:**
   Repeated swipes on the same profile are safe and idempotent (`UNIQUE(user_id, target_id)` constraint in SQLite). Duplicate matches cannot be triggered.

---

## Design Decisions & Aesthetic Direction

Coy avoids the typical "gamified dating app" look (no loud neon pinks, no confetti explosions, no heart stickers, and no gradient text). Instead, Coy embraces an **editorial, quiet, and confident** atmosphere inspired by high-end iOS publications:

- **Color Palette (CSS Variables):**
  - **Background (`--bg-primary`):** Warm off-white (`#FAF8F5`), providing a gentle paper-like canvas. Dark mode uses a disciplined warm charcoal (`#141312`).
  - **Ink (`--text-primary`):** Deep charcoal ink (`#1A1816`) with high contrast and readability.
  - **Restrained Accent (`--accent`):** A warm terracotta crimson (`#A83B3B` / `#C74E4E` in dark mode) used **only** for the Like action stamp and the match moment.
  - **Pass Neutral (`--pass`):** Clean stone slate (`#57534E`) for passing.
- **Typography:**
  - *Serif:* `Newsreader` (Google Fonts) for profile names, ages, and the match headline, imparting literary warmth.
  - *Sans:* `Inter` for interface controls, metadata tags, and bios.
- **Card Design:**
  - Full-bleed portrait photography with an intentional bottom scrim gradient for maximum legibility.
  - Intentional radii (`28px`), refined elevation shadows, and touch-drag mechanics powered by `framer-motion`.
  - Subtle stamp overlays ("LIKE" and "PASS") fade in smoothly based on drag distance and release past a 100px / velocity threshold.
- **Match Screen:**
  - Restrained and elegant. Two portrait cards side-by-side with slight rotational overlap, headline *"It's a match."*, and two clear actions: *"Keep swiping"* and *"View matches"*. No confetti.
- **Accessibility & Motion:**
  - Fully respects `prefers-reduced-motion` (disables card rotation and speeds up exit transitions).
  - Keyboard operable with Left Arrow (Pass) and Right Arrow (Like).
  - Touch targets all exceed 44px with visible focus indicators.
  - Skeleton loaders instead of spinning wheels.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, React 19, TypeScript)
- **Database:** SQLite via `better-sqlite3` (WAL mode enabled, zero configuration required)
- **Styling:** Tailwind CSS with semantic CSS variables and dark mode support
- **Gestures & Animation:** `framer-motion`
- **Icons:** `lucide-react`
- **Testing:** `vitest`

---

## Getting Started

### Prerequisites
- Node.js 18+ (tested on Node v20 and v22)
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Mock Database
```bash
npm run seed
```
Creates `data/coy.db` and populates it with 32 realistic mock profiles (12 pre-marked as having liked the user to allow immediate demo matching).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or whichever port is assigned) in your browser.

Alternatively, build and run the optimized production build:
```bash
npm run build
npm start
```

---

## Database & Seeding

The database is powered by SQLite stored in `data/coy.db`.

```bash
npm run seed
```
- Creates 4 tables: `profiles`, `swipes`, `matches`, and `user_account`.
- Seeds 32 unique profiles with:
  - Ages 18–26
  - Authentic bios (under 120 characters)
  - 3–4 interests per profile
  - Curated high-resolution portrait imagery
  - 12 profiles marked as having liked the logged-in user (`"me"`), ensuring that right swipes during a demo trigger matches naturally.
- A **"Reset demo data"** button is also available directly in the Discover header to clear swipes and matches at any time without restarting the server.

---

## API Documentation

### 1. `GET /api/feed`
Retrieves profiles that the current user has not yet swiped on. Profiles are randomly ordered and completely sanitized of any internal like status.

**Response `200 OK`:**
```json
{
  "profiles": [
    {
      "id": "coy_1",
      "name": "Maya Lin",
      "age": 22,
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "bio": "cooper union architecture. mostly wandering lower manhattan searching for warm cardamom buns.",
      "city": "Lower East Side, NY",
      "interests": ["Architecture", "Film 35mm", "Cardamom Buns", "Ceramics"]
    }
  ]
}
```

---

### 2. `POST /api/swipe`
Records a swipe (`like` or `pass`). Returns `{ match: true, profile: { ... } }` **only** if the action results in a mutual match; otherwise returns `{ match: false }`.

**Request Body:**
```json
{
  "profileId": "coy_1",
  "direction": "like"
}
```

**Response `200 OK` (Mutual Match):**
```json
{
  "match": true,
  "profile": {
    "id": "coy_1",
    "name": "Maya Lin",
    "age": 22,
    "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "bio": "cooper union architecture. mostly wandering lower manhattan searching for warm cardamom buns.",
    "city": "Lower East Side, NY",
    "interests": ["Architecture", "Film 35mm", "Cardamom Buns", "Ceramics"]
  }
}
```

**Response `200 OK` (Not a match, or Passed):**
```json
{
  "match": false
}
```

**Error Responses:**
- `400 Bad Request`: Invalid `profileId` or `direction` (must be `"like"` or `"pass"`).
- `404 Not Found`: Profile does not exist.

---

### 3. `GET /api/matches`
Returns all mutual matches for the user, ordered by most recent first.

**Response `200 OK`:**
```json
{
  "matches": [
    {
      "id": "coy_1",
      "name": "Maya Lin",
      "age": 22,
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "bio": "cooper union architecture. mostly wandering lower manhattan searching for warm cardamom buns.",
      "city": "Lower East Side, NY",
      "interests": ["Architecture", "Film 35mm", "Cardamom Buns", "Ceramics"],
      "matchedAt": "2026-11-20T11:45:00.000Z"
    }
  ]
}
```

---

### 4. `POST /api/reset`
Resets all swipes and mutual matches for user `"me"`, returning all profiles to the feed for demo testing.

**Response `200 OK`:**
```json
{
  "ok": true,
  "message": "Demo swipes and matches reset successfully."
}
```

---

## Automated Testing

Unit and integration tests are powered by **Vitest**.

Run all test suites:
```bash
npm test
```

### Test Coverage Highlights:
- **`tests/matching.test.ts`**: Pure matching logic unit tests:
  - Like + Liked-me creates a match.
  - Like + Not-liked-me does not create a match.
  - Pass never creates a match even if the target liked the user.
  - Repeat swipe is idempotent.
  - Feed excludes swiped profiles.
  - Feed never includes private fields (`likedUser`, `likedMe`, etc.).
  - Profile sanitizer strictly drops internal server flags.
- **`tests/db.test.ts`**: Integration tests against SQLite:
  - Feed query excludes swiped profiles and hides private columns.
  - Idempotent swipe persistence with database constraints.
  - Match insertion and query retrieval.
  - Reset demo data functionality.

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── feed/route.ts        # GET /api/feed (sanitized, randomized)
│   │   ├── swipe/route.ts       # POST /api/swipe (idempotent, mutual matching)
│   │   ├── matches/route.ts     # GET /api/matches
│   │   ├── me/route.ts          # GET /api/me (current user profile)
│   │   └── reset/route.ts       # POST /api/reset (demo reset)
│   ├── globals.css              # Theme CSS variables, typography, iOS safe areas
│   ├── layout.tsx               # Root layout, Google Fonts (Newsreader + Inter)
│   └── page.tsx                 # App Shell & state orchestration
├── components/
│   ├── CardStack.tsx            # Multi-card deck, keyboard shortcuts, empty/loading states
│   ├── DiscoverHeader.tsx       # Coy mark, view toggle, dark mode, reset demo
│   ├── HomeView.tsx             # Calm editorial home screen
│   ├── MatchesList.tsx          # Mutual matches grid and detail view
│   ├── MatchModal.tsx           # Restrained "It's a match!" full-screen dialog
│   ├── SwipeCard.tsx            # Gestures, drag physics, photo scrim, tags
│   └── TabBar.tsx               # Bottom navigation (Home & Discover)
├── lib/
│   ├── db.ts                    # SQLite database queries and transactions
│   ├── matching.ts              # Pure matching & privacy logic
│   └── types.ts                 # TypeScript interfaces
├── scripts/
│   └── seed.ts                  # Seed script with 32 realistic profiles
├── tests/
│   ├── db.test.ts               # SQLite integration tests
│   └── matching.test.ts         # Pure matching logic unit tests
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
