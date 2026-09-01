# Chargeback Shield — Full-Stack Build

**Razorpay AI Buildathon — Track 02: AI Risk Manager**

An AI-powered dispute triage dashboard for merchants, with a real backend,
real authentication, and a real login/landing flow — not a static mockup.

## What's new in this version

- **Real-time updates**: the dashboard polls the backend every 15 seconds
  and silently refreshes — if a teammate (or another browser tab) changes
  data, you'll see it appear without reloading the page. Verified by
  creating a queue via a raw API call in a separate process while the
  browser tab stayed open, and watching it appear automatically.
- **Review Queues are clickable filters**: click any queue card on the
  Dispute Queue screen to filter the table below to exactly the disputes
  that queue's rule matches (same reason-code + confidence logic the
  backend uses to compute each queue's live count). Click again to clear.


- **Landing page → Login/Register → Dashboard** flow. Opening the app for
  the first time shows a marketing landing page, not the dashboard directly.
- **Real authentication**: register/login create a session (password hashed
  with `scrypt`, session tokens stored server-side). Logging out actually
  clears the session and returns you to the landing page.
- **Working search**: the header search icon opens a live search overlay
  that filters the real dispute queue by ID, reason code, or signal text.
- **Working notifications**: the bell icon shows a real unread count and
  opens a dropdown of server-generated notifications — new account, threshold
  changes, queue creation, evidence submissions — each with a timestamp.
- **Actions actually mutate state and refresh the UI**: saving new
  thresholds retrains the model and updates every screen; submitting an
  evidence packet marks that dispute submitted and generates a notification;
  creating a review queue persists it and confirms it.

## Architecture

```
┌─────────────────────┐        ┌──────────────────────────┐        ┌─────────────────┐
│   React + Vite       │  HTTP  │   Express (server/)       │  SQL   │  SQLite          │
│   Landing → Login     │──────► │   /api/auth/*               │──────► │  users            │
│   → App (dashboard)   │        │   /api/bootstrap             │        │  sessions          │
│                       │        │   /api/settings/thresholds     │        │  disputes           │
│                       │        │   /api/queues, /api/notifications│      │  review_queues       │
└─────────────────────┘        └──────────────────────────┘        │  notifications        │
                                          │                          └─────────────────┘
                                          ▼
                                 ┌──────────────────┐
                                 │  server/ml/        │
                                 │  - generateData.ts  │ synthetic disputes
                                 │  - detector.ts       │ logistic regression (from scratch)
                                 │  - agent.ts           │ evidence packet assembly
                                 │  - format.ts           │ ₹ Indian number formatting
                                 └──────────────────┘
```

In development, Vite's dev server (`vite.config.ts`) mounts the Express

app as middleware for any request starting with `/api` — so frontend and
backend run on **one port**, no CORS configuration needed in dev. This is
the standard Figma Make full-stack pattern.

## Why no external ML/DB libraries

- **Detector**: a logistic regression model implemented from scratch in
  `server/ml/detector.ts` (gradient descent, feature standardization,
  per-row feature-importance for the explainability panel). No scikit-learn
  equivalent needed — keeps the project dependency-light and every line of
  the model auditable.
- **Database**: uses Node 22's built-in `node:sqlite` module. Real
  persistent SQLite, zero native compilation, zero extra `npm install`.

## What's real vs. what's a stub

**Real, working, computed live:**
- 150 synthetic disputes generated with a documented ground-truth
  simulation (`server/ml/generateData.ts`)
- A logistic regression model trained on a separate 450-row pool and
  scored against the 150 displayed disputes (held-out evaluation)
- Precision / recall / F1 / accuracy / confusion matrix — all computed
  from actual model predictions, not hardcoded
- Revenue impact (recovered value, capture rate) — computed from which
  disputes were actually auto-fought vs. actually winnable
- Evidence packets — assembled per reason code via a real rules engine,
  gated so incomplete evidence is never marked submittable
- Settings sliders — changing thresholds and clicking Save **retrains the
  detector and re-scores every dispute** through a real API round-trip
- "New Review Queue" modal — persists to the `review_queues` SQLite table

**Stubbed / not wired to a larger system (intentionally, for an MVP):**
- "Submit Packet" and "Submit Queue" buttons don't call a real payment
  network — there's no real card network to submit to in a demo
- Regenerating the dataset (`POST /api/disputes/regenerate`) uses the same
  fixed random seed, so it won't produce a different-looking dataset yet

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:8443`). The backend
seeds itself automatically on first run (creates `server/chargeback_shield.db`).

### Other scripts

```bash
npm run build     # production frontend build (dist/)
npm run server    # run the Express server standalone (no Vite), for prod deployment
```

## API Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | Public | Body: `{ username, password, displayName }`. Creates account, returns `{ token, user }` |
| POST | `/api/auth/login` | Public | Body: `{ username, password }`. Returns `{ token, user }` |
| POST | `/api/auth/logout` | Bearer | Destroys the current session |
| GET | `/api/auth/me` | Bearer | Returns the current user for a valid token |
| GET | `/api/bootstrap` | Bearer | Everything the dashboard needs: metrics, revenue, disputes, evidence, rules, thresholds |
| PUT | `/api/settings/thresholds` | Bearer | Body: `{ fightThreshold, acceptThreshold }` (50-95 / 5-45). Retrains + re-scores, returns updated bootstrap |
| POST | `/api/queues` | Bearer | Body: `{ name, reasonCodes, minConfidence, priority, reviewer }`. Creates a review queue |
| GET | `/api/queues` | Bearer | List all created review queues |
| POST | `/api/disputes/:id/submit` | Bearer | Marks a dispute's evidence packet as submitted, returns updated bootstrap |
| POST | `/api/disputes/regenerate` | Bearer | Regenerates the dispute dataset from scratch |
| GET | `/api/notifications` | Bearer | List notifications (newest first) |
| POST | `/api/notifications/:id/read` | Bearer | Marks one notification read |
| POST | `/api/notifications/read-all` | Bearer | Marks all notifications read |

All routes except `/api/health` and `/api/auth/*` require an
`Authorization: Bearer <token>` header. The frontend's `src/api.ts` handles
this automatically once a token is stored (via `localStorage`, which is safe
here since this runs as its own app, not inside a sandboxed iframe).

## Project structure

```
├── server/                  Backend (Express + TypeScript)
│   ├── index.ts              Express app + routes
│   ├── db.ts                  SQLite schema + connection
│   ├── engine.ts               Seeding, recomputation, bootstrap assembly
│   └── ml/
│       ├── generateData.ts      Synthetic dispute generator
│       ├── detector.ts           Logistic regression + confidence gating
│       ├── agent.ts               Evidence packet rules engine
│       └── format.ts               Indian currency formatting
├── src/                      Frontend (React + Vite + Tailwind v4)
│   ├── App.tsx                 Main dashboard UI (all screens)
│   ├── api.ts                   Typed fetch client for the backend
│   ├── main.tsx                  React entrypoint
│   └── index.css                  Tailwind entrypoint
├── vite.config.ts            Vite config incl. Express middleware mount
└── package.json
```

## What broke, and how I got out

[Fill this in from your own experience testing/extending this build — this
field matters most to reviewers. Some real things worth reflecting on:
- The default confidence thresholds (65% fight / 35% accept) were tuned
  by trial and error against the model's actual probability distribution —
  the first attempt at 80/25 routed 80% of disputes to human review, which
  defeated the point of automation. What would you tune next?
- Node's native TypeScript execution (used here so the server runs without
  a separate build step) requires `import type` for type-only imports and
  exact `.ts` extensions on relative imports — an easy way to hit a
  confusing runtime error if you're used to bundler-only projects.
- What would you change if you had another week?]
