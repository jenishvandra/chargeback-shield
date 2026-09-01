import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto'
import { db } from './db.ts'

export interface User {
  id: number
  username: string
  display_name: string
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex')
}

export function createUser(username: string, password: string, displayName: string): User {
  const salt = randomBytes(16).toString('hex')
  const hash = hashPassword(password, salt)
  const result = db
    .prepare('INSERT INTO users (username, password_hash, password_salt, display_name) VALUES (?, ?, ?, ?)')
    .run(username, hash, salt, displayName)
  return { id: Number(result.lastInsertRowid), username, display_name: displayName }
}

export function verifyLogin(username: string, password: string): User | null {
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any
  if (!row) return null
  const attemptHash = hashPassword(password, row.password_salt)
  const a = Buffer.from(attemptHash, 'hex')
  const b = Buffer.from(row.password_hash, 'hex')
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  return { id: row.id, username: row.username, display_name: row.display_name }
}

export function createSession(userId: number): string {
  const token = randomBytes(32).toString('hex')
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, userId)
  return token
}

export function getUserByToken(token: string): User | null {
  const row = db
    .prepare(
      `SELECT users.* FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.token = ?`,
    )
    .get(token) as any
  if (!row) return null
  return { id: row.id, username: row.username, display_name: row.display_name }
}

export function destroySession(token: string): void {
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token)
}

export function usernameExists(username: string): boolean {
  const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
  return !!row
}
