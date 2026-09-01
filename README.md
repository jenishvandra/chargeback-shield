<div align="center">

# 🛡️ Chargeback Shield

### AI-powered dispute triage for merchants — explainable, bounded, and gated.

**Razorpay AI Buildathon 2026 · Track 02: AI Risk Manager**

![Node](https://img.shields.io/badge/Node-22%2B-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-native-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/status-MVP-EF4444)

</div>

---

## What is this?

Merchants get flooded with payment disputes and chargebacks. Most get
**auto-accepted by default** because nobody has time to manually review
each one — even when the merchant had real evidence and could have won.

**Chargeback Shield** is an AI agent that:
1. **Scores** every incoming dispute's win probability using a model trained on transaction signals
2. **Decides** — FIGHT, ACCEPT, or REVIEW — but only auto-decides when it's confident enough
3. **Assembles** a submission-ready evidence packet, picking only the evidence relevant to that dispute's reason code
4. **Explains** every decision in plain language, with the exact signals that drove it

Built end-to-end: real backend, real database, real authentication, real ML model — not a static mockup.

<div align="center">
<img src="docs/screenshots/03-dashboard.png" alt="Chargeback Shield Dashboard" width="850"/>
</div>

---

## ✨ Features

| | |
|---|---|
| 🔐 **Real auth** | Register/login with `scrypt`-hashed passwords, server-side sessions |
| 📊 **Live metrics** | Precision, recall, F1, confusion matrix — computed from actual model predictions on a held-out set |
| 🤖 **Explainable AI** | Every decision shows a feature-importance breakdown and a plain-language reason |
| 🚦 **Confidence gating** | Uncertain cases route to a human instead of the model guessing |
| 📁 **Evidence packets** | Auto-assembled per reason code; incomplete evidence is never marked submittable |
| 🎯 **Review Queues** | Create routing rules by reason code + confidence; click to filter matching disputes live |
| 🔔 **Real notifications** | Server-generated events for every meaningful action, with unread counts |
| 🔍 **Live search** | Instantly filter the dispute queue by ID, reason, or signal |
| ⚡ **Real-time sync** | Dashboard polls every 15s — changes from any session appear automatically |
| 🎚️ **Tunable thresholds** | Adjust fight/accept confidence sliders — the model **retrains live** |

---

## 📸 Screens

<table>
<tr>
<td width="50%">

**Landing**
<img src="docs/screenshots/01-landing.png" width="100%"/>
</td>
<td width="50%">

**Login / Register**
<img src="docs/screenshots/02-login.png" width="100%"/>
</td>
</tr>
<tr>
<td width="50%">

**Dispute Queue + Review Queues**
<img src="docs/screenshots/04-dispute-queue.png" width="100%"/>
</td>
<td width="50%">

**Evidence Packets**
<img src="docs/screenshots/05-evidence-packets.png" width="100%"/>
</td>
</tr>
<tr>
<td width="50%">

**Model Performance**
<img src="docs/screenshots/06-model-performance.png" width="100%"/>
</td>
<td width="50%">

**Explainability Panel**
<img src="docs/screenshots/09-explainability-panel.png" width="100%"/>
</td>
</tr>
<tr>
<td width="50%">

**Reason Code Rules**
<img src="docs/screenshots/07-reason-code-rules.png" width="100%"/>
</td>
<td width="50%">

**Decision Settings**
<img src="docs/screenshots/08-settings.png" width="100%"/>
</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────────────┐         ┌───────────────────────────┐         ┌──────────────────┐
│   React 19 + Vite      │  HTTP   │   Express 5 (server/)       │  SQL    │   SQLite (native)  │
│                        │────────►│                              │────────►│                    │
│  Landing → Login        │         │  /api/auth/*                  │         │  users              │
│    → Dashboard          │◄────────│  /api/bootstrap                │◄────────│  sessions            │
│                        │  JSON   │  /api/settings/thresholds        │  rows   │  disputes             │
│                        │         │  /api/queues                       │         │  review_queues          │
│                        │         │  /api/notifications                  │         │  notifications            │
└──────────────────────┘         └───────────────────────────┘         └──────────────────┘
                                              │
                                              ▼
                                   ┌────────────────────┐
                                   │   server/ml/          │
                                   │   generateData.ts       │  synthetic dispute simulation
                                   │   detector.ts              │  logistic regression, from scratch
                                   │   agent.ts                    │  evidence-packet rules engine
                                   │   format.ts                      │  ₹ Indian currency formatting
                                   └────────────────────┘
```

In dev, Vite's server mounts the Express app as middleware for any `/api/*`
request — frontend and backend share **one port**, no CORS setup needed.

### Why no external ML or database libraries

- **Detector** — a logistic regression model implemented from scratch
  (`server/ml/detector.ts`): gradient descent, feature standardization, and
  per-row feature-importance for the explainability panel. Every line of
  the model is auditable; no black-box dependency.
- **Database** — Node 22's built-in [`node:sqlite`](https://nodejs.org/api/sqlite.html)
  module. Real persistent SQLite with **zero** native compilation and zero
  extra installs.

---

## 🚀 Running it

```bash
git clone https://github.com/jenishvandra/chargeback-shield.git
cd chargeback-shield
npm install
npm run dev
```

Open the printed local URL (default `http://localhost:8443`). The database
seeds itself automatically on first run — no manual setup.

> First time? Click **"Get Started"** on the landing page, then use
> **"Skip → Use Demo Account"** on the login screen for instant access.

### Other scripts

```bash
npm run build     # production frontend build → dist/
npm run server    # run the Express server standalone (no Vite), for deployment
```

---

## 🔌 API Reference

| Method | Path | Auth | Description |
|---|---|:---:|---|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/auth/register` | — | `{ username, password, displayName }` → `{ token, user }` |
| `POST` | `/api/auth/login` | — | `{ username, password }` → `{ token, user }` |
| `POST` | `/api/auth/logout` | 🔒 | Destroys the current session |
| `GET` | `/api/auth/me` | 🔒 | Returns the current user |
| `GET` | `/api/bootstrap` | 🔒 | Everything the dashboard needs in one call |
| `PUT` | `/api/settings/thresholds` | 🔒 | `{ fightThreshold, acceptThreshold }` → retrains + re-scores |
| `POST` | `/api/queues` | 🔒 | `{ name, reasonCodes, minConfidence, priority, reviewer }` |
| `GET` | `/api/queues` | 🔒 | List all review queues |
| `POST` | `/api/disputes/:id/submit` | 🔒 | Marks an evidence packet submitted |
| `POST` | `/api/disputes/regenerate` | 🔒 | Regenerates the dispute dataset |
| `GET` | `/api/notifications` | 🔒 | List notifications, newest first |
| `POST` | `/api/notifications/:id/read` | 🔒 | Marks one notification read |
| `POST` | `/api/notifications/read-all` | 🔒 | Marks all notifications read |

🔒 = requires `Authorization: Bearer <token>`. `src/api.ts` handles this
automatically once a token is stored.

---

## ✅ What's real vs. stubbed

**Real, computed live — not hardcoded:**
- 150 synthetic disputes from a documented ground-truth simulation
- A logistic regression model trained on a separate 450-row pool, evaluated on held-out data
- Precision / recall / F1 / accuracy / confusion matrix — all from actual predictions
- Revenue impact — computed from which disputes were actually auto-fought vs. actually winnable
- Evidence packets — assembled per reason code by a real rules engine
- Threshold sliders — saving **retrains the detector and re-scores every dispute**
- Review queues — persist to SQLite, live-computed match counts

**Intentionally stubbed for this MVP:**
- "Submit Packet" doesn't call a real card network — there isn't one to call in a demo
- Regenerating the dataset reuses the same seed, so results are reproducible rather than random

---

## 📁 Project structure

```
├── server/                      Backend — Express + TypeScript
│   ├── index.ts                   routes + auth middleware
│   ├── db.ts                        SQLite schema + connection
│   ├── engine.ts                      seeding, recompute, bootstrap assembly
│   └── ml/
│       ├── generateData.ts             synthetic dispute generator
│       ├── detector.ts                   logistic regression + confidence gating
│       ├── agent.ts                        evidence-packet rules engine
│       └── format.ts                         ₹ formatting
├── src/                        Frontend — React + Vite + Tailwind v4
│   ├── App.tsx                   main dashboard (all screens)
│   ├── Landing.tsx                 marketing landing page
│   ├── Login.tsx                     login / register
│   ├── api.ts                          typed fetch client
│   └── ErrorBoundary.tsx                 crash-safe error screen
├── docs/screenshots/           README images
├── vite.config.ts              Vite config incl. Express middleware mount
└── package.json
```

---

## 🐛 What broke, and how I got out

Building this end-to-end surfaced a few real problems worth noting:

**1. Default thresholds made automation pointless.** The first attempt used
an 80% fight / 25% accept threshold — intuitively "safe," but against the
model's actual probability distribution it routed **80% of disputes to
human review**, defeating the entire point of an automation agent. I ran
the eval across several threshold combinations and landed on 65%/35%,
which auto-decides ~58% of cases while keeping precision above 70%.

**2. Node's native TypeScript execution has sharp edges.** Running the
server directly via `node server/index.ts` (no build step) means type-only
imports must use `import type`, and relative imports need the literal
`.ts` extension — importing with `.js` (a common bundler habit) throws a
confusing `ERR_MODULE_NOT_FOUND` at runtime instead of a clear TS error.

**3. A UI crash with no visible error.** Mid-refactor, a component got
deleted while a caller still referenced it — clicking the notification
bell threw an uncaught exception that silently unmounted the entire React
tree, leaving a blank white screen with zero feedback. Fixed by adding a
proper `ErrorBoundary` (`src/ErrorBoundary.tsx`) so any future crash shows
a readable error instead of nothing.

**4. Git/environment setup on a fresh Windows machine.** Git wasn't
installed, `git commit` failed with an unknown-author error, and the first
push attempt landed a real SQLite database file (with password hashes and
session tokens) into the repo before `.gitignore` caught it. All fixed,
but a reminder that "push to GitHub" hides a few real setup steps for
anyone starting from zero.

**What I'd do with another week:** wire evidence-packet submission to a
real sandbox card-network API, add a feedback loop where human overrides
on REVIEW cases retrain the model, and move session storage to Redis for
horizontal scaling.

---

<div align="center">

Built for the **Razorpay AI Buildathon** · Track 02: AI Risk Manager

</div>
