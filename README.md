# Coy Discover

> "Find out if your crush likes you back. If they don't, nobody ever knows."

**Coy Discover** is a calm, discreet, swipe-based discovery feature built as a standalone mobile-first application. Designed with quiet confidence, editorial typography, and uncompromising privacy guarantees, Coy ensures that a crush is only revealed when interest is strictly mutual.

---

## Table of Contents
1. [Core Privacy Architecture](#core-privacy-architecture)
2. [Design Decisions & Aesthetic Direction](#design-decisions--aesthetic-direction)
3. [1-Click Match Messaging & Chat](#1-click-match-messaging--chat)
4. [Tech Stack](#tech-stack)
5. [Getting Started](#getting-started)
6. [Database & Seeding](#database--seeding)
7. [API Documentation](#api-documentation)
8. [Automated Testing](#automated-testing)
9. [Project Structure](#project-structure)

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
  - Displays name, age, city, height (e.g. 5'5"), bio, and interest tags.
  - Intentional radii (`28px`), refined elevation shadows, and touch-drag mechanics powered by `framer-motion`.
  - Subtle stamp overlays ("LIKE" and "PASS") fade in smoothly based on drag distance and release past a 100px / velocity threshold.
- **Gender & Demographic Preferences:**
  - Intuitive preferences modal ("Sliders" icon in header):
    - **Identity & Interest:** Set gender (Man/Woman) and orientation (Women/Men/Everyone). Automatic smart defaults filter the feed accordingly.
    - **Location Filter:** Filter by specific Indian cultural hubs (Bangalore, Mumbai, Delhi, Kolkata, Chennai, Pondicherry, Goa, Ahmedabad).
    - **Height Display:** Subtle height attribution on every card.
- **Match Screen:**
  - Restrained and elegant. Two portrait cards side-by-side with slight rotational overlap, headline *"It's a match."*, and two clear actions: *"Keep swiping"* and *"View matches"*. No confetti.
- **Accessibility & Motion:**
  - Fully respects `prefers-reduced-motion` (disables card rotation and speeds up exit transitions).
  - Keyboard operable with Left Arrow (Pass) and Right Arrow (Like).
  - Touch targets all exceed 44px with visible focus indicators.
  - Skeleton loaders instead of spinning wheels.

---

## 1-Click Match Messaging & Chat

In the **Matches** section:
1. Tap any mutual match to open the conversation drawer.
2. **1-Click Custom Icebreakers:** Send a tailored conversation starter in a single click (or type your own custom message).
3. **Wait for Reply:** Once sent, your message appears with status *"Sent • Waiting for [Name] to reply..."*. The composer is paused until the match responds.
4. **Contextual Match Reply & Unlock:** After an authentic typing pause, the match replies contextually based on their background. A banner indicates *"[Name] replied! You can now message freely."*, permanently unlocking full real-time interactive messaging.
5. All chat messages persist in SQLite across reloads.

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
Creates `data/coy.db` and populates it with 32 authentic Indian profiles (16 female, 16 male; 16 pre-marked mutual likes to allow immediate demo matching).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

Alternatively, run the production build:
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
- Creates 5 tables: `profiles`, `swipes`, `matches`, `messages`, and `user_account`.
- Seeds 32 unique profiles with:
  - Ages 20–26
  - Authentic bios (under 120 characters)
  - 3–4 interests per profile
  - Curated high-resolution portrait imagery
  - 16 profiles marked as having liked the logged-in user (`"me"`), ensuring that right swipes during a demo trigger matches naturally for both male and female preferences.
- A **"Reset demo data"** button is available directly in the Discover header to clear swipes, matches, and messages at any time.

---

## API Documentation

### 1. `GET /api/feed`
Retrieves profiles that the current user has not yet swiped on. Profiles are randomly ordered and completely sanitized of any internal like status. Supports `?gender=female|male|all` and `?city=...`.

**Response `200 OK`:**
```json
{
  "profiles": [
    {
      "id": "coy_1",
      "name": "Ananya Sen",
      "age": 22,
      "gender": "female",
      "height": "5'5\"",
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "bio": "nift delhi grad. handloom textiles by day, hunting vintage calcutta vinyl at 2am. let’s get chai.",
      "city": "Hauz Khas, New Delhi",
      "interests": ["Handloom", "Filter Coffee", "Vinyl Records", "Textile Archives"]
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
    "name": "Ananya Sen",
    "age": 22,
    "gender": "female",
    "height": "5'5\"",
    "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    "bio": "nift delhi grad. handloom textiles by day, hunting vintage calcutta vinyl at 2am. let’s get chai.",
    "city": "Hauz Khas, New Delhi",
    "interests": ["Handloom", "Filter Coffee", "Vinyl Records", "Textile Archives"]
  }
}
```

**Response `200 OK` (Not a match, or Passed):**
```json
{
  "match": false
}
```

---

### 3. `GET /api/matches`
Returns all mutual matches for the user, ordered by most recent first.

**Response `200 OK`:**
```json
{
  "matches": [
    {
      "id": "coy_1",
      "name": "Ananya Sen",
      "age": 22,
      "gender": "female",
      "height": "5'5\"",
      "photo": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      "bio": "nift delhi grad. handloom textiles by day, hunting vintage calcutta vinyl at 2am. let’s get chai.",
      "city": "Hauz Khas, New Delhi",
      "interests": ["Handloom", "Filter Coffee", "Vinyl Records", "Textile Archives"],
      "matchedAt": "2026-11-20T17:50:00.000Z"
    }
  ]
}
```

---

### 4. `GET /api/messages?targetId=coy_1` & `POST /api/messages`
Fetches and sends chat messages.

**Request Body (POST):**
```json
{
  "targetId": "coy_1",
  "text": "Hey Ananya! Loved your bio :)"
}
```

**Response `200 OK`:**
```json
{
  "messages": [
    {
      "id": 1,
      "targetId": "coy_1",
      "senderId": "me",
      "text": "Hey Ananya! Loved your bio :)",
      "createdAt": "2026-11-20T17:51:00.000Z"
    },
    {
      "id": 2,
      "targetId": "coy_1",
      "senderId": "coy_1",
      "text": "Hey! So happy we matched! Love your bio :) Would love to get chai this weekend! Have you been to Blue Tokai in Hauz Khas?",
      "createdAt": "2026-11-20T17:51:01.000Z"
    }
  ],
  "reply": { ... }
}
```

---

### 5. `POST /api/reset`
Resets all swipes, mutual matches, and messages for user `"me"`.

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

```bash
# Run 19 unit & DB tests
npm test

# Run 12-point live end-to-end verification
npm run test:e2e
```

---

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── feed/route.ts        # GET /api/feed (sanitized, randomized, filtered)
│   │   ├── swipe/route.ts       # POST /api/swipe (idempotent, mutual matching)
│   │   ├── matches/route.ts     # GET /api/matches
│   │   ├── messages/route.ts    # GET & POST /api/messages (1-click chat & reply)
│   │   ├── me/route.ts          # GET & POST /api/me (user preferences)
│   │   └── reset/route.ts       # POST /api/reset (demo reset)
│   ├── globals.css              # Theme CSS variables, typography, iOS safe areas
│   ├── layout.tsx               # Root layout, Google Fonts (Newsreader + Inter)
│   ├── not-found.tsx            # Quiet 404 page
│   └── page.tsx                 # App Shell & state orchestration
├── components/
│   ├── CardStack.tsx            # Multi-card deck, keyboard shortcuts, empty/loading states
│   ├── ChatDrawer.tsx           # 1-click icebreakers, wait-for-reply, real-time messaging
│   ├── DiscoverHeader.tsx       # Coy mark, view toggle, dark mode, reset demo, filters
│   ├── FilterModal.tsx          # Gender identity, orientation, and city filters
│   ├── HomeView.tsx             # Calm editorial home screen
│   ├── MatchesList.tsx          # Mutual matches grid and chat opener
│   ├── MatchModal.tsx           # Restrained "It's a match!" full-screen dialog
│   ├── SwipeCard.tsx            # Gestures, drag physics, photo scrim, tags, height
│   └── TabBar.tsx               # Bottom navigation (Home & Discover)
├── lib/
│   ├── db.ts                    # SQLite database queries and transactions
│   ├── matching.ts              # Pure matching & privacy logic
│   └── types.ts                 # TypeScript interfaces
├── scripts/
│   ├── seed.ts                  # Seed script with 32 authentic Indian profiles
│   └── verify-e2e.ts            # Automated E2E verification test script
├── tests/
│   ├── db.test.ts               # SQLite integration tests
│   └── matching.test.ts         # Pure matching logic unit tests
├── .gitignore
├── next.config.mjs
├── package.json
├── tailwind.config.js
└── tsconfig.json
```
