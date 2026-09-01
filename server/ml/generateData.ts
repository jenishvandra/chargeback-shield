// Generates synthetic payment dispute (chargeback) data.
//
// Each row is one disputed transaction with the signals a merchant/PSP
// would plausibly have at triage time. `fightWorthIt` is the simulated
// ground truth (whether fighting the dispute would actually have won),
// used to train the detector and compute precision/recall.

export const REASON_CODES = [
  'product_not_received',
  'product_unacceptable',
  'duplicate_charge',
  'credit_not_processed',
  'fraudulent_transaction',
  'subscription_canceled',
  'unrecognized_charge',
] as const

export type ReasonCode = (typeof REASON_CODES)[number]

export const REASON_CODE_LABELS: Record<ReasonCode, string> = {
  product_not_received: 'Product Not Received',
  product_unacceptable: 'Product Unacceptable',
  duplicate_charge: 'Duplicate Charge',
  credit_not_processed: 'Credit Not Processed',
  fraudulent_transaction: 'Fraudulent Transaction',
  subscription_canceled: 'Subscription Canceled',
  unrecognized_charge: 'Unrecognized Charge',
}

const BASE_WIN_PRIOR: Record<ReasonCode, number> = {
  product_not_received: 0.55,
  product_unacceptable: 0.35,
  duplicate_charge: 0.85,
  credit_not_processed: 0.75,
  fraudulent_transaction: 0.15,
  subscription_canceled: 0.30,
  unrecognized_charge: 0.45,
}

export interface DisputeRow {
  disputeId: string
  reasonCode: ReasonCode
  amountInr: number
  hasDeliveryProof: number
  hasCustomerComm: number
  hasRefundRecord: number
  priorDisputesByCustomer: number
  accountAgeDays: number
  daysSinceTxn: number
  customerVerified: number
  fightWorthIt: number
}

// Deterministic seeded PRNG (mulberry32) so results are reproducible.
function mulberry32(seed: number) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function poisson(rng: () => number, lambda: number): number {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng()
  } while (p > L)
  return k - 1
}

export function generateDisputes(n: number, seed: number): DisputeRow[] {
  const rng = mulberry32(seed)
  const rows: DisputeRow[] = []

  for (let i = 0; i < n; i++) {
    const reasonCode = REASON_CODES[Math.floor(rng() * REASON_CODES.length)]

    // log-normal-ish amount via Box-Muller
    const u1 = Math.max(rng(), 1e-9)
    const u2 = rng()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    let amount = Math.exp(8.2 + 1.0 * z)
    amount = Math.min(Math.round(amount * 100) / 100, 250000)

    const hasDeliveryProof = rng() < (reasonCode === 'product_not_received' ? 0.7 : 0.3) ? 1 : 0
    const hasCustomerComm = rng() < 0.5 ? 1 : 0
    const hasRefundRecord = rng() < (reasonCode === 'credit_not_processed' ? 0.8 : 0.2) ? 1 : 0
    const customerVerified = rng() < 0.6 ? 1 : 0
    const priorDisputesByCustomer = poisson(rng, 0.4)
    const accountAgeDays = Math.round(-400 * Math.log(1 - rng() + 1e-9))
    const daysSinceTxn = 1 + Math.floor(rng() * 119)

    const evidenceScore =
      0.35 * hasDeliveryProof +
      0.2 * hasCustomerComm +
      0.25 * hasRefundRecord +
      0.1 * customerVerified +
      0.1 * (priorDisputesByCustomer === 0 ? 1 : 0)

    const basePrior = BASE_WIN_PRIOR[reasonCode]
    let winProb =
      0.15 + 0.6 * evidenceScore + 0.35 * basePrior - 0.05 * Math.min(priorDisputesByCustomer, 3)
    winProb = Math.min(Math.max(winProb, 0.02), 0.97)
    const fightWorthIt = rng() < winProb ? 1 : 0

    rows.push({
      disputeId: `DSP-${1000 + i}`,
      reasonCode,
      amountInr: amount,
      hasDeliveryProof,
      hasCustomerComm,
      hasRefundRecord,
      priorDisputesByCustomer,
      accountAgeDays,
      daysSinceTxn,
      customerVerified,
      fightWorthIt,
    })
  }

  return rows
}
