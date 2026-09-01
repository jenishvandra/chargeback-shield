// Core engine tying together data generation, the detector, and the agent.
//
// Design choice: only the 150 disputes shown in the UI are persisted in
// the database (the merchant's live dispute queue / held-out evaluation
// set). A larger training pool (450 synthetic disputes) is regenerated
// fresh in-memory from a fixed seed each time and used only to fit the
// logistic regression - a merchant never needs to see it, so there's no
// reason to store it. Retraining on 450 rows takes a few ms, so this
// happens synchronously whenever thresholds change.

import { db } from './db.ts'
import { generateDisputes, REASON_CODES, REASON_CODE_LABELS } from './ml/generateData.ts'
import type { DisputeRow, ReasonCode } from './ml/generateData.ts'
import { DisputeDetector } from './ml/detector.ts'
import { assemblePacket, EVIDENCE_REQUIREMENTS, EVIDENCE_LABELS } from './ml/agent.ts'
import { formatInr } from './ml/format.ts'

const DISPLAY_SET_SIZE = 150
const DISPLAY_SET_SEED = 42
const TRAIN_POOL_SIZE = 450
const TRAIN_POOL_SEED = 1

interface DisputeDbRow {
  id: string
  reason_code: string
  reason_label: string
  amount: number
  amount_display: string
  has_delivery_proof: number
  has_customer_comm: number
  has_refund_record: number
  prior_disputes_by_customer: number
  account_age_days: number
  days_since_txn: number
  customer_verified: number
  fight_worth_it: number
  win_probability: number
  decision: string
  signals: string
  confidence_label: string
  explanation: string
  features_json: string
  included_evidence_json: string
  missing_evidence_json: string
  submittable: number
  submitted: number
}

function trainDetector(): DisputeDetector {
  const trainRows = generateDisputes(TRAIN_POOL_SIZE, TRAIN_POOL_SEED)
  return new DisputeDetector().fit(trainRows)
}

export function addNotification(type: string, message: string): void {
  db.prepare('INSERT INTO notifications (type, message) VALUES (?, ?)').run(type, message)
}

export function getNotifications() {
  return db.prepare('SELECT * FROM notifications ORDER BY created_at DESC LIMIT 50').all()
}

export function markNotificationRead(id: number): void {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(id)
}

export function markAllNotificationsRead(): void {
  db.exec('UPDATE notifications SET read = 1 WHERE read = 0')
}

export function submitDispute(id: string): { ok: boolean; error?: string } {
  const row = db.prepare('SELECT * FROM disputes WHERE id = ?').get(id) as any
  if (!row) return { ok: false, error: 'Dispute not found' }
  if (row.decision === 'ACCEPT') return { ok: false, error: 'Accepted disputes cannot be submitted' }
  if (!row.submittable) return { ok: false, error: 'Evidence packet is incomplete - cannot submit' }
  if (row.submitted) return { ok: false, error: 'Already submitted' }

  db.prepare('UPDATE disputes SET submitted = 1 WHERE id = ?').run(id)
  addNotification('submission', `Evidence packet for ${id} (${row.reason_label}, ${row.amount_display}) submitted for dispute resolution.`)
  return { ok: true }
}

export function ensureSeeded() {
  const settingsCount = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as any).c
  if (settingsCount === 0) {
    db.prepare('INSERT INTO settings (id, fight_threshold, accept_threshold) VALUES (1, 65, 35)').run()
  }

  const disputeCount = (db.prepare('SELECT COUNT(*) as c FROM disputes').get() as any).c
  if (disputeCount > 0) return

  const rows = generateDisputes(DISPLAY_SET_SIZE, DISPLAY_SET_SEED)
  const insert = db.prepare(`
    INSERT INTO disputes (
      id, reason_code, reason_label, amount, amount_display,
      has_delivery_proof, has_customer_comm, has_refund_record,
      prior_disputes_by_customer, account_age_days, days_since_txn,
      customer_verified, fight_worth_it
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)
  for (const row of rows) {
    insert.run(
      row.disputeId,
      row.reasonCode,
      REASON_CODE_LABELS[row.reasonCode],
      row.amountInr,
      formatInr(row.amountInr),
      row.hasDeliveryProof,
      row.hasCustomerComm,
      row.hasRefundRecord,
      row.priorDisputesByCustomer,
      row.accountAgeDays,
      row.daysSinceTxn,
      row.customerVerified,
      row.fightWorthIt,
    )
  }

  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any
  recompute(settings.fight_threshold, settings.accept_threshold)
}

function confidenceLabel(decision: string, probPct: number, fightT: number, acceptT: number): string {
  if (decision === 'FIGHT') return probPct >= fightT + 10 ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'
  if (decision === 'ACCEPT') return probPct <= acceptT - 10 ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'
  const mid = (fightT + acceptT) / 2
  const band = Math.max((fightT - acceptT) / 4, 5)
  return Math.abs(probPct - mid) < band ? 'LOW CONFIDENCE' : 'MEDIUM CONFIDENCE'
}

function topSignalText(row: DisputeDbRow): string {
  const bits: string[] = []
  bits.push(row.has_delivery_proof ? 'delivery proof available' : 'no delivery proof')
  if (row.has_refund_record) bits.push('refund already recorded')
  if (row.has_customer_comm) bits.push('customer communication on file')
  if (row.prior_disputes_by_customer >= 2) bits.push(`customer has ${row.prior_disputes_by_customer} prior disputes`)
  if (row.customer_verified) bits.push('customer identity verified')
  return bits.length ? bits.slice(0, 3).join('; ') : 'limited signal available'
}

function explanationText(decision: string, reasonLabel: string, topSignal: string): string {
  if (decision === 'FIGHT') {
    return `This ${reasonLabel.toLowerCase()} dispute is likely winnable — ${topSignal}. The model recommends fighting it.`
  }
  if (decision === 'ACCEPT') {
    return `Evidence is weak for this ${reasonLabel.toLowerCase()} dispute — ${topSignal}. Accepting is the lower-cost outcome.`
  }
  return `Confidence is below the auto-decide threshold for this ${reasonLabel.toLowerCase()} dispute — ${topSignal}. A human reviewer should assess before acting.`
}

function dbRowToDisputeRow(d: DisputeDbRow): DisputeRow {
  return {
    disputeId: d.id,
    reasonCode: d.reason_code as ReasonCode,
    amountInr: d.amount,
    hasDeliveryProof: d.has_delivery_proof,
    hasCustomerComm: d.has_customer_comm,
    hasRefundRecord: d.has_refund_record,
    priorDisputesByCustomer: d.prior_disputes_by_customer,
    accountAgeDays: d.account_age_days,
    daysSinceTxn: d.days_since_txn,
    customerVerified: d.customer_verified,
    fightWorthIt: d.fight_worth_it,
  }
}

export function recompute(fightThresholdPct: number, acceptThresholdPct: number) {
  const detector = trainDetector()
  const fightT = fightThresholdPct / 100
  const acceptT = acceptThresholdPct / 100

  const disputes = db.prepare('SELECT * FROM disputes').all() as unknown as DisputeDbRow[]
  if (disputes.length === 0) return

  const update = db.prepare(`
    UPDATE disputes SET
      win_probability = ?, decision = ?, signals = ?, confidence_label = ?,
      explanation = ?, features_json = ?, included_evidence_json = ?,
      missing_evidence_json = ?, submittable = ?, recommendation = ?
    WHERE id = ?
  `)

  const tx = db.prepare('BEGIN')
  const commit = db.prepare('COMMIT')
  tx.run()

  for (const d of disputes) {
    const disputeRow = dbRowToDisputeRow(d)
    const prob = detector.predictProba(disputeRow)
    const probPct = prob * 100

    let decision: string
    if (prob >= fightT) decision = 'FIGHT'
    else if (prob <= acceptT) decision = 'ACCEPT'
    else decision = 'REVIEW'

    const topSignal = topSignalText(d)
    const packet = assemblePacket(disputeRow)
    const features = detector.topFeatureContributions(disputeRow)

    const signals = `${topSignal.charAt(0).toUpperCase()}${topSignal.slice(1)}; reason: ${d.reason_label.toLowerCase()}`
    const confidence = confidenceLabel(decision, probPct, fightThresholdPct, acceptThresholdPct)
    const explanation = explanationText(decision, d.reason_label, topSignal)

    update.run(
      Math.round(probPct * 10) / 10,
      decision,
      signals,
      confidence,
      explanation,
      JSON.stringify(features),
      JSON.stringify(packet.includedEvidence),
      JSON.stringify(packet.missingEvidence),
      packet.submittable ? 1 : 0,
      packet.recommendation,
      d.id,
    )
  }

  db.prepare('UPDATE settings SET fight_threshold = ?, accept_threshold = ? WHERE id = 1').run(
    fightThresholdPct,
    acceptThresholdPct,
  )

  commit.run()
}

function evaluate() {
  const disputes = db.prepare('SELECT decision, fight_worth_it, amount FROM disputes').all() as any[]
  let tp = 0, fp = 0, fn = 0, tn = 0, review = 0
  for (const d of disputes) {
    if (d.decision === 'FIGHT' && d.fight_worth_it === 1) tp++
    else if (d.decision === 'FIGHT' && d.fight_worth_it === 0) fp++
    else if (d.decision === 'ACCEPT' && d.fight_worth_it === 1) fn++
    else if (d.decision === 'ACCEPT' && d.fight_worth_it === 0) tn++
    if (d.decision === 'REVIEW') review++
  }
  const total = disputes.length
  const auto = tp + fp + fn + tn
  const precision = tp + fp ? tp / (tp + fp) : 0
  const recall = tp + fn ? tp / (tp + fn) : 0
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0
  const accuracy = auto ? (tp + tn) / auto : 0
  const reviewRate = total ? review / total : 0

  return {
    precision: Math.round(precision * 1000) / 10,
    recall: Math.round(recall * 1000) / 10,
    f1: Math.round(f1 * 1000) / 10,
    accuracy: Math.round(accuracy * 1000) / 10,
    autoDecided: auto,
    total,
    reviewRate: Math.round(reviewRate * 1000) / 10,
    confusion: { trueFight: tp, falseFight: fp, falseAccept: fn, trueAccept: tn },
  }
}

function revenue() {
  const disputes = db.prepare('SELECT decision, fight_worth_it, amount FROM disputes').all() as any[]
  let recovered = 0
  let totalFightable = 0
  for (const d of disputes) {
    if (d.fight_worth_it === 1) {
      totalFightable += d.amount
      if (d.decision === 'FIGHT') recovered += d.amount
    }
  }
  const captureRate = totalFightable ? Math.round((recovered / totalFightable) * 100) : 0
  return {
    recoveredValue: recovered,
    recoveredValueDisplay: formatInr(recovered),
    totalFightable,
    totalFightableDisplay: formatInr(totalFightable),
    captureRate,
  }
}

function rules() {
  const confidenceByReason: Record<string, string> = {
    product_not_received: '80%',
    duplicate_charge: '75%',
    fraudulent_transaction: '85%',
    credit_not_processed: '78%',
    product_unacceptable: '70%',
    subscription_canceled: '72%',
    unrecognized_charge: '76%',
  }
  return REASON_CODES.map((code) => {
    const fields = EVIDENCE_REQUIREMENTS[code]
    const evidenceStr = fields.map((f) => EVIDENCE_LABELS[f].split(' / ')[0]).join(', ')
    return {
      code: REASON_CODE_LABELS[code],
      evidence: evidenceStr,
      confidence: confidenceByReason[code] ?? '75%',
      status: 'Active',
    }
  })
}

function disputeToApi(d: DisputeDbRow) {
  return {
    id: d.id,
    reasonCode: d.reason_label,
    amount: d.amount_display,
    winProbability: Math.round(d.win_probability),
    decision: d.decision,
    signals: d.signals,
    submitted: !!(d as any).submitted,
    panel: {
      features: JSON.parse(d.features_json),
      explanation: d.explanation,
      gating: d.decision !== 'REVIEW' ? 'auto' : 'human',
      confidence: d.confidence_label,
      missingEvidence: JSON.parse(d.missing_evidence_json).length ? JSON.parse(d.missing_evidence_json) : null,
    },
  }
}

export function getBootstrap() {
  const disputes = db
    .prepare('SELECT * FROM disputes ORDER BY win_probability DESC')
    .all() as unknown as DisputeDbRow[]
  const settings = db.prepare('SELECT * FROM settings WHERE id = 1').get() as any
  const queueRows = db.prepare('SELECT * FROM review_queues ORDER BY created_at DESC').all() as any[]

  const disputeList = disputes.map(disputeToApi)

  const evidence = disputes
    .filter((d) => d.decision !== 'ACCEPT')
    .map((d) => ({
      id: d.id,
      reasonCode: d.reason_label,
      amount: d.amount_display,
      decision: d.decision,
      includedEvidence: JSON.parse(d.included_evidence_json),
      missingEvidence: JSON.parse(d.missing_evidence_json),
      submittable: !!d.submittable && !d.submitted,
      submitted: !!d.submitted,
      recommendation: d.submitted ? 'Already submitted for resolution.' : d.recommendation,
    }))

  // A created review queue is a saved filter/routing rule, so we compute how
  // many currently-open (non-submitted) disputes it would currently match -
  // that's what makes it feel "live" rather than a dead record.
  const queues = queueRows.map((q) => {
    const codes = (q.reason_codes as string)
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean)
    const matching = disputes.filter((d) => {
      const reasonMatch = codes.length === 0 || codes.includes(d.reason_label)
      const confidenceMatch = d.win_probability >= q.min_confidence
      return reasonMatch && confidenceMatch && !d.submitted
    }).length

    return {
      id: q.id as number,
      name: q.name as string,
      reasonCodes: q.reason_codes as string,
      minConfidence: q.min_confidence as number,
      priority: q.priority as string,
      reviewer: q.reviewer as string,
      createdAt: q.created_at as string,
      matchingDisputes: matching,
    }
  })

  return {
    metrics: evaluate(),
    revenue: revenue(),
    disputes: disputeList,
    evidence,
    rules: rules(),
    queues,
    thresholds: {
      fightThreshold: Math.round(settings.fight_threshold),
      acceptThreshold: Math.round(settings.accept_threshold),
    },
  }
}
