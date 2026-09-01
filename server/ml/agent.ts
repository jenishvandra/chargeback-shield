// Chargeback Shield - Evidence Packet Agent
//
// For every dispute marked FIGHT (or REVIEW, so a human can see what's
// already available), decides WHICH evidence is relevant based on the
// reason code - a fixed template would attach delivery proof to a
// "duplicate charge" dispute, which is useless.
//
// This mapping is intentionally rule-based rather than learned: evidence
// requirements per dispute reason are a known, stable mapping (card
// networks publish exactly what's needed per reason code), so hard-coding
// domain knowledge here is more auditable than an ML model would be.

import type { DisputeRow, ReasonCode } from './generateData.ts'

type EvidenceField = 'hasDeliveryProof' | 'hasCustomerComm' | 'hasRefundRecord' | 'customerVerified'

export const EVIDENCE_REQUIREMENTS: Record<ReasonCode, EvidenceField[]> = {
  product_not_received: ['hasDeliveryProof', 'hasCustomerComm'],
  product_unacceptable: ['hasCustomerComm'],
  duplicate_charge: ['hasRefundRecord'],
  credit_not_processed: ['hasRefundRecord', 'hasCustomerComm'],
  fraudulent_transaction: ['customerVerified'],
  subscription_canceled: ['hasCustomerComm'],
  unrecognized_charge: ['customerVerified', 'hasCustomerComm'],
}

export const EVIDENCE_LABELS: Record<EvidenceField, string> = {
  hasDeliveryProof: 'Delivery confirmation / carrier tracking',
  hasCustomerComm: 'Customer communication log',
  hasRefundRecord: 'Refund / credit transaction record',
  customerVerified: 'Customer identity verification',
}

export interface EvidencePacket {
  includedEvidence: string[]
  missingEvidence: string[]
  submittable: boolean
  recommendation: string
}

export function assemblePacket(row: DisputeRow): EvidencePacket {
  const required = EVIDENCE_REQUIREMENTS[row.reasonCode]
  const included: string[] = []
  const missing: string[] = []

  for (const field of required) {
    if (row[field] === 1) included.push(EVIDENCE_LABELS[field])
    else missing.push(EVIDENCE_LABELS[field])
  }

  const submittable = included.length > 0 && missing.length === 0
  const recommendation = submittable
    ? 'All required evidence is present. Ready to submit as-is.'
    : 'Missing required evidence for this reason code - hold for human review before submitting.'

  return { includedEvidence: included, missingEvidence: missing, submittable, recommendation }
}
