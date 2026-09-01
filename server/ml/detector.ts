// Chargeback Shield - Detector
//
// Scores each dispute with a logistic regression model trained from
// scratch via gradient descent (no external ML library - keeps the
// project dependency-free and the math fully inspectable/explainable,
// which matters since "explainable" is a hard requirement of the brief).
//
// A confidence gate sits on top of the raw probability:
//   probability >= fightThreshold  -> FIGHT  (auto-decided)
//   probability <= acceptThreshold -> ACCEPT (auto-decided)
//   otherwise                      -> REVIEW (routed to a human)

import { REASON_CODES } from './generateData.ts'
import type { DisputeRow } from './generateData.ts'

const NUMERIC_FEATURES = [
  'amountInr',
  'hasDeliveryProof',
  'hasCustomerComm',
  'hasRefundRecord',
  'priorDisputesByCustomer',
  'accountAgeDays',
  'daysSinceTxn',
  'customerVerified',
] as const

type NumericFeature = (typeof NUMERIC_FEATURES)[number]

export const FEATURE_DISPLAY_LABELS: Record<string, string> = {
  hasDeliveryProof: 'Delivery proof',
  hasRefundRecord: 'Refund record',
  customerVerified: 'Customer verified',
  priorDisputesByCustomer: 'Prior disputes (risk)',
  hasCustomerComm: 'Customer communication',
  amountInr: 'Transaction amount',
  accountAgeDays: 'Account age',
  daysSinceTxn: 'Recency of transaction',
}

function featurize(row: DisputeRow): number[] {
  const numeric = NUMERIC_FEATURES.map((f) => row[f as NumericFeature] as number)
  const oneHot = REASON_CODES.map((code) => (row.reasonCode === code ? 1 : 0))
  return [...numeric, ...oneHot]
}

const FEATURE_NAMES: string[] = [...NUMERIC_FEATURES, ...REASON_CODES.map((c) => `reason_${c}`)]

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}

export class DisputeDetector {
  private mean: number[] = []
  private std: number[] = []
  private weights: number[] = []
  private bias = 0

  fit(rows: DisputeRow[], epochs = 2500, lr = 0.5, l2 = 0.002): this {
    const X = rows.map(featurize)
    const y = rows.map((r) => r.fightWorthIt)
    const nFeatures = X[0].length
    const n = X.length

    this.mean = new Array(nFeatures).fill(0)
    this.std = new Array(nFeatures).fill(1)
    for (let j = 0; j < nFeatures; j++) {
      let sum = 0
      for (let i = 0; i < n; i++) sum += X[i][j]
      this.mean[j] = sum / n
    }
    for (let j = 0; j < nFeatures; j++) {
      let sq = 0
      for (let i = 0; i < n; i++) sq += (X[i][j] - this.mean[j]) ** 2
      this.std[j] = Math.sqrt(sq / n) || 1
    }

    const Xs = X.map((row) => row.map((v, j) => (v - this.mean[j]) / this.std[j]))

    this.weights = new Array(nFeatures).fill(0)
    this.bias = 0

    for (let epoch = 0; epoch < epochs; epoch++) {
      const gradW = new Array(nFeatures).fill(0)
      let gradB = 0
      for (let i = 0; i < n; i++) {
        let z = this.bias
        for (let j = 0; j < nFeatures; j++) z += this.weights[j] * Xs[i][j]
        const pred = sigmoid(z)
        const err = pred - y[i]
        for (let j = 0; j < nFeatures; j++) gradW[j] += err * Xs[i][j]
        gradB += err
      }
      for (let j = 0; j < nFeatures; j++) {
        this.weights[j] -= (lr * (gradW[j] / n + l2 * this.weights[j])) 
      }
      this.bias -= lr * (gradB / n)
    }

    return this
  }

  private standardize(row: DisputeRow): number[] {
    const x = featurize(row)
    return x.map((v, j) => (v - this.mean[j]) / this.std[j])
  }

  predictProba(row: DisputeRow): number {
    const xs = this.standardize(row)
    let z = this.bias
    for (let j = 0; j < xs.length; j++) z += this.weights[j] * xs[j]
    return sigmoid(z)
  }

  /** Approximate per-row feature importance: |weight * standardized_value|,
   * normalized 0-100 for display as bars in the explainability panel. */
  topFeatureContributions(row: DisputeRow, topN = 5): { label: string; value: number }[] {
    const xs = this.standardize(row)
    const contributions = xs.map((v, j) => Math.abs(this.weights[j] * v))
    const maxC = Math.max(...contributions, 1e-9)
    const pairs = FEATURE_NAMES.map((name, j) => ({
      name,
      value: (contributions[j] / maxC) * 100,
    })).filter((p) => !p.name.startsWith('reason_'))

    pairs.sort((a, b) => b.value - a.value)
    return pairs.slice(0, topN).map((p) => ({
      label: FEATURE_DISPLAY_LABELS[p.name] ?? p.name,
      value: Math.round(p.value),
    }))
  }
}
