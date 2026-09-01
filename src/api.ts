export interface FeatureContribution {
  label: string
  value: number
}

export interface DisputePanel {
  features: FeatureContribution[]
  explanation: string
  gating: 'auto' | 'human'
  confidence: string
  missingEvidence: string[] | null
}

export interface ApiDispute {
  id: string
  reasonCode: string
  amount: string
  winProbability: number
  decision: 'FIGHT' | 'REVIEW' | 'ACCEPT'
  signals: string
  submitted: boolean
  panel: DisputePanel
}

export interface ApiEvidencePacket {
  id: string
  reasonCode: string
  amount: string
  decision: string
  includedEvidence: string[]
  missingEvidence: string[]
  submittable: boolean
  submitted: boolean
  recommendation: string
}

export interface ApiRule {
  code: string
  evidence: string
  confidence: string
  status: string
}

export interface ApiConfusion {
  trueFight: number
  falseFight: number
  trueAccept: number
  falseAccept: number
}

export interface ApiMetrics {
  precision: number
  recall: number
  f1: number
  accuracy: number
  autoDecided: number
  total: number
  reviewRate: number
  confusion: ApiConfusion
}

export interface ApiRevenue {
  recoveredValue: number
  recoveredValueDisplay: string
  totalFightable: number
  totalFightableDisplay: string
  captureRate: number
}

export interface ApiThresholds {
  fightThreshold: number
  acceptThreshold: number
}

export interface ApiReviewQueue {
  id: number
  name: string
  reasonCodes: string
  minConfidence: number
  priority: string
  reviewer: string
  createdAt: string
  matchingDisputes: number
}

export interface Bootstrap {
  metrics: ApiMetrics
  revenue: ApiRevenue
  disputes: ApiDispute[]
  evidence: ApiEvidencePacket[]
  rules: ApiRule[]
  queues: ApiReviewQueue[]
  thresholds: ApiThresholds
}

export interface User {
  id: number
  username: string
  display_name: string
}

export interface Notification {
  id: number
  type: string
  message: string
  read: number
  created_at: string
}

const TOKEN_KEY = 'chargeback_shield_token'
const USER_KEY = 'chargeback_shield_user'

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function getStoredUser(): User | null {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}

function storeSession(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  })
  if (res.status === 401) {
    clearSession()
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  // Auth
  register: async (username: string, password: string, displayName: string) => {
    const result = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, displayName }),
    })
    storeSession(result.token, result.user)
    return result.user
  },

  login: async (username: string, password: string) => {
    const result = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
    storeSession(result.token, result.user)
    return result.user
  },

  logout: async () => {
    try {
      await request('/api/auth/logout', { method: 'POST' })
    } finally {
      clearSession()
    }
  },

  me: () => request<{ user: User }>('/api/auth/me'),

  // Notifications
  getNotifications: () => request<Notification[]>('/api/notifications'),
  markNotificationRead: (id: number) => request(`/api/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request('/api/notifications/read-all', { method: 'POST' }),

  // Dashboard
  getBootstrap: () => request<Bootstrap>('/api/bootstrap'),

  updateThresholds: (fightThreshold: number, acceptThreshold: number) =>
    request<Bootstrap>('/api/settings/thresholds', {
      method: 'PUT',
      body: JSON.stringify({ fightThreshold, acceptThreshold }),
    }),

  createQueue: (input: {
    name: string
    reasonCodes: string
    minConfidence: number
    priority: string
    reviewer: string
  }) =>
    request('/api/queues', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  submitDispute: (id: string) => request<Bootstrap>(`/api/disputes/${id}/submit`, { method: 'POST' }),

  regenerateDisputes: () =>
    request<Bootstrap>('/api/disputes/regenerate', { method: 'POST' }),
}
