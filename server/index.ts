import express from 'express'
import cors from 'cors'
import { initSchema, db } from './db.ts'
import { ensureSeeded, recompute, getBootstrap, addNotification, getNotifications, markNotificationRead, markAllNotificationsRead, submitDispute } from './engine.ts'
import { createUser, verifyLogin, createSession, getUserByToken, destroySession, usernameExists } from './auth.ts'
import type { User } from './auth.ts'

initSchema()
ensureSeeded()

const api = express()
api.use(cors())
api.use(express.json())

// ── Auth ────────────────────────────────────────────────────────────────────

api.post('/api/auth/register', (req, res) => {
  try {
    const { username, password, displayName } = req.body ?? {}
    if (typeof username !== 'string' || username.trim().length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters.' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' })
    }
    if (usernameExists(username.trim())) {
      return res.status(409).json({ error: 'That username is already taken.' })
    }
    const user = createUser(username.trim(), password, (displayName || username).trim())
    const token = createSession(user.id)
    addNotification('account', `Welcome, ${user.display_name}! Your merchant account is ready.`)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to register.' })
  }
})

api.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body ?? {}
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Username and password are required.' })
    }
    const user = verifyLogin(username.trim(), password)
    if (!user) return res.status(401).json({ error: 'Invalid username or password.' })
    const token = createSession(user.id)
    res.json({ token, user })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to log in.' })
  }
})

api.post('/api/auth/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  if (token) destroySession(token)
  res.json({ ok: true })
})

api.get('/api/auth/me', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const user = token ? getUserByToken(token) : null
  if (!user) return res.status(401).json({ error: 'Not authenticated.' })
  res.json({ user })
})

// ── Health check (public, for infra monitoring) ──────────────────────────────
api.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' })
})

// ── Auth middleware for everything below this line ──────────────────────────
declare module 'express-serve-static-core' {
  interface Request {
    user?: User
  }
}

api.use((req, res, next) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '')
  const user = token ? getUserByToken(token) : null
  if (!user) return res.status(401).json({ error: 'Not authenticated. Please log in.' })
  req.user = user
  next()
})

// ── Dashboard data ────────────────────────────────────────────────────────────

api.get('/api/bootstrap', (_req, res) => {
  try {
    res.json(getBootstrap())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to load dashboard data' })
  }
})

api.put('/api/settings/thresholds', (req, res) => {
  try {
    const { fightThreshold, acceptThreshold } = req.body ?? {}
    if (
      typeof fightThreshold !== 'number' ||
      typeof acceptThreshold !== 'number' ||
      fightThreshold < 50 || fightThreshold > 95 ||
      acceptThreshold < 5 || acceptThreshold > 45
    ) {
      return res.status(400).json({ error: 'fightThreshold must be 50-95 and acceptThreshold 5-45' })
    }
    recompute(fightThreshold, acceptThreshold)
    addNotification(
      'threshold',
      `Decision thresholds updated to Fight >=${fightThreshold}% / Accept <=${acceptThreshold}% - model retrained and queue re-scored.`,
    )
    res.json(getBootstrap())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update thresholds' })
  }
})

api.post('/api/queues', (req, res) => {
  try {
    const { name, reasonCodes = '', minConfidence = 70, priority = 'Medium', reviewer = '' } = req.body ?? {}
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'name is required' })
    }
    const result = db
      .prepare(
        'INSERT INTO review_queues (name, reason_codes, min_confidence, priority, reviewer) VALUES (?, ?, ?, ?, ?)',
      )
      .run(name, reasonCodes, minConfidence, priority, reviewer)

    addNotification('queue', `New review queue "${name}" created (priority: ${priority}).`)

    res.status(201).json({
      id: Number(result.lastInsertRowid),
      name,
      reasonCodes,
      minConfidence,
      priority,
      reviewer,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create review queue' })
  }
})

api.get('/api/queues', (_req, res) => {
  const rows = db.prepare('SELECT * FROM review_queues ORDER BY created_at DESC').all()
  res.json(rows)
})

api.post('/api/disputes/:id/submit', (req, res) => {
  const result = submitDispute(req.params.id)
  if (!result.ok) return res.status(400).json({ error: result.error })
  res.json(getBootstrap())
})

api.post('/api/disputes/regenerate', (_req, res) => {
  try {
    db.exec('DELETE FROM disputes')
    ensureSeeded()
    addNotification('system', 'Dispute queue regenerated with a fresh batch of synthetic disputes.')
    res.json(getBootstrap())
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to regenerate disputes' })
  }
})

// ── Notifications ─────────────────────────────────────────────────────────────

api.get('/api/notifications', (_req, res) => {
  res.json(getNotifications())
})

api.post('/api/notifications/:id/read', (req, res) => {
  markNotificationRead(Number(req.params.id))
  res.json({ ok: true })
})

api.post('/api/notifications/read-all', (_req, res) => {
  markAllNotificationsRead()
  res.json({ ok: true })
})

export const app = api
