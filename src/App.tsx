import { useState, useEffect, useCallback } from 'react'
import { api, getToken, getStoredUser } from './api'
import type {
  ApiDispute, ApiEvidencePacket, ApiRule, ApiMetrics, ApiRevenue, ApiThresholds, ApiReviewQueue, Bootstrap,
  User, Notification,
} from './api'
import Landing from './Landing'
import Login from './Login'

// ── Types ───────────────────────────────────────────────────────────────────
type Screen = 'dashboard' | 'queue' | 'evidence' | 'performance' | 'rules' | 'settings'
type Decision = 'FIGHT' | 'REVIEW' | 'ACCEPT'
type FilterType = 'ALL' | Decision

// Dispute shape used throughout the UI is the API's dispute shape directly -
// panel/explainability data comes embedded on each dispute from the backend.
type Dispute = ApiDispute

// ── Icons ────────────────────────────────────────────────────────────────────
function IconShield({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function IconGrid({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  )
}
function IconDoc({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  )
}
function IconFileCheck({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" /><polyline points="9 15 11 17 15 13" />
    </svg>
  )
}
function IconBarChart({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  )
}
function IconSliders({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}
function IconSettings({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  )
}
function IconSearch({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}
function IconBell({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" />
    </svg>
  )
}
function IconX({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
function IconChevronDown({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}
function IconEdit({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}
function IconUser({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  )
}
function IconTrendUp({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
    </svg>
  )
}
function IconTrendDown({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" /><polyline points="17 18 23 18 23 12" />
    </svg>
  )
}
function IconPlus({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
function IconLogout({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}
function IconArrowRight({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  )
}
function IconLock({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

// ── Decision Badge ──────────────────────────────────────────────────────────
function DecisionBadge({ decision }: { decision: Decision }) {
  const styles: Record<Decision, string> = {
    FIGHT: 'bg-[#22C55E] text-white',
    REVIEW: 'bg-[#F59E0B] text-[#0D0D0D]',
    ACCEPT: 'bg-[#9CA3AF] text-[#0D0D0D] border border-[#EF4444]',
  }
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest ${styles[decision]}`}>
      {decision}
    </span>
  )
}

// ── Probability Bar ──────────────────────────────────────────────────────────
function ProbabilityBar({ value }: { value: number }) {
  const color = value >= 70 ? '#22C55E' : value >= 40 ? '#F59E0B' : '#9CA3AF'
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <span className="text-sm font-bold text-[#0D0D0D] w-9 shrink-0">{value}%</span>
      <div className="flex-1 h-1.5 bg-gray-200 overflow-hidden">
        <div className="h-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

// ── Circular Gauge ──────────────────────────────────────────────────────────
function CircularGauge({ value, size = 120, color = '#EF4444' }: { value: number; size?: number; color?: string }) {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="butt"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-black text-[#0D0D0D]" style={{ fontSize: size * 0.2 }}>{value}%</span>
      </div>
    </div>
  )
}

// ── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, trend, trendUp }: {
  label: string; value: string; sub?: string; trend: string; trendUp: boolean
}) {
  return (
    <div className="bg-white border border-gray-100 shadow-sm flex-1 min-w-0 relative stat-card" style={{ borderTop: '3px solid #EF4444' }}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">{label}</span>
          <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trendUp ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
            {trendUp ? <IconTrendUp /> : <IconTrendDown />}
            {trend}
          </span>
        </div>
        <div className="text-3xl font-black text-[#0D0D0D] leading-none mb-1">{value}</div>
        {sub && <div className="text-xs text-[#6B7280] mt-1 font-medium">{sub}</div>}
      </div>
    </div>
  )
}

// ── Dispute Table ────────────────────────────────────────────────────────────
function DisputeTable({ disputes, onView }: { disputes: Dispute[]; onView: (d: Dispute) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr style={{ borderBottom: '2px solid #EF4444' }}>
            {['DISPUTE ID', 'REASON CODE', 'AMOUNT', 'WIN PROBABILITY', 'DECISION', 'TOP SIGNALS', 'ACTION'].map(col => (
              <th key={col} className="text-left py-3 px-4 text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]">{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {disputes.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-16 text-center">
                <div className="text-[#6B7280] text-sm font-medium uppercase tracking-wider">NO DISPUTES MATCH YOUR FILTER</div>
                <div className="text-[#9CA3AF] text-xs mt-1">Try changing your decision filter or date range.</div>
              </td>
            </tr>
          ) : disputes.map((d, i) => (
            <tr
              key={d.id}
              className={`row-hover border-b border-gray-100/50 transition-colors ${i % 2 === 1 ? 'bg-white/30' : 'bg-white/55'}`}
            >
              <td className="py-3.5 px-4 text-sm font-bold text-[#0D0D0D] font-mono">{d.id}</td>
              <td className="py-3.5 px-4 text-sm text-[#0D0D0D]">{d.reasonCode}</td>
              <td className="py-3.5 px-4 text-sm font-bold text-[#0D0D0D]">{d.amount}</td>
              <td className="py-3.5 px-4"><ProbabilityBar value={d.winProbability} /></td>
              <td className="py-3.5 px-4"><DecisionBadge decision={d.decision} /></td>
              <td className="py-3.5 px-4 text-xs text-[#6B7280] max-w-[200px]">{d.signals}</td>
              <td className="py-3.5 px-4">
                <button
                  onClick={() => onView(d)}
                  className="text-xs font-bold uppercase tracking-wider text-[#EF4444] border border-[#EF4444] px-3 py-1 hover:bg-[#EF4444] hover:text-white transition-colors"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Filter Chips ─────────────────────────────────────────────────────────────
function FilterChips({ active, onChange }: { active: FilterType; onChange: (f: FilterType) => void }) {
  const options: FilterType[] = ['ALL', 'FIGHT', 'ACCEPT', 'REVIEW']
  return (
    <div className="flex gap-2">
      {options.map(opt => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 text-[11px] font-black uppercase tracking-widest transition-all ${
            active === opt
              ? 'bg-[#EF4444] text-white shadow-[0_4px_10px_-3px_rgba(239,68,68,0.5)]'
              : 'bg-white border border-[#0D0D0D] text-[#0D0D0D] hover:bg-gray-50 btn-secondary'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

// ── Evidence Card ─────────────────────────────────────────────────────────────
function EvidenceCard({ packet, onSubmit }: { packet: ApiEvidencePacket; onSubmit: (id: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const complete = packet.submittable

  const handleSubmit = async () => {
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit(packet.id)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-gray-200 shadow-sm overflow-hidden card-lift bg-white" style={{ borderRadius: 4 }}>
      <button
        className="w-full text-left bg-[#0D0D0D] px-6 py-4 flex items-center justify-between"
        onClick={() => setExpanded(e => !e)}
      >
        <div className="flex items-center gap-4">
          <span className="text-white font-black font-mono text-sm">{packet.id}</span>
          <span className="text-[#EF4444] font-bold text-sm">{packet.amount}</span>
          <span className="text-xs text-gray-400 uppercase">{packet.reasonCode}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-xs font-bold uppercase tracking-wider ${
            packet.submitted ? 'text-[#6B7280]' : complete ? 'text-[#22C55E]' : 'text-[#F59E0B]'
          }`}>
            {packet.submitted ? '✓ SUBMITTED' : complete ? '✓ SUBMITTABLE' : '⚠ INCOMPLETE'}
          </span>
          <IconChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="bg-white p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] mb-3 pb-2 border-b border-gray-100">
                Included Evidence
              </div>
              <ul className="space-y-2">
                {packet.includedEvidence.length === 0 ? (
                  <li className="text-sm text-[#9CA3AF] italic">None available</li>
                ) : packet.includedEvidence.map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                    <span className="text-[#22C55E] font-bold">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              {packet.missingEvidence.length ? (
                <div className="mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] mb-3 pb-2 border-b border-gray-100">
                    Missing Evidence
                  </div>
                  <ul className="space-y-2">
                    {packet.missingEvidence.map(item => (
                      <li key={item} className="flex items-center gap-2 text-sm text-[#0D0D0D]">
                        <span className="text-[#F59E0B] font-bold">⚠</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="bg-gray-50 border border-gray-100 p-4">
                <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">Agent Recommendation</div>
                <p className="text-xs text-[#6B7280] italic leading-relaxed">
                  {packet.recommendation}
                </p>
              </div>
            </div>
          </div>
          {submitError && <p className="text-xs font-bold text-[#EF4444] mt-4">{submitError}</p>}
          <div className="flex justify-end mt-5">
            <button
              onClick={handleSubmit}
              className={`px-5 py-2 text-xs font-black uppercase tracking-widest transition-all ${
                packet.submitted
                  ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  : complete
                  ? 'btn-primary text-white'
                  : 'bg-[#9CA3AF] text-white cursor-not-allowed'
              }`}
              disabled={!complete || packet.submitted || submitting}
            >
              {packet.submitted ? '✓ Submitted' : submitting ? 'Submitting…' : 'Submit Packet'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Explainability Panel ──────────────────────────────────────────────────────
function ExplainabilityPanel({ dispute, onClose }: { dispute: Dispute | null; onClose: () => void }) {
  if (!dispute) return null
  const data = dispute.panel
  const isAuto = data?.gating === 'auto'

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />
      <div
        className="fixed top-0 right-0 h-full bg-white/90 backdrop-blur-2xl z-50 flex flex-col shadow-2xl overflow-y-auto scrollbar-hide border-l border-white/40"
        style={{ width: 'min(460px, 100vw)' }}
      >
        {/* Panel header */}
        <div className="bg-[#0D0D0D] px-6 py-5 flex items-start justify-between shrink-0">
          <div>
            <div className="text-white font-black font-mono text-lg">{dispute.id}</div>
            <div className="text-gray-400 text-xs uppercase tracking-widest mt-1">{dispute.reasonCode}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors mt-0.5">
            <IconX />
          </button>
        </div>

        {/* Red divider */}
        <div className="h-0.5 bg-[#EF4444] shrink-0" />

        <div className="flex-1 p-6 space-y-6">
          {/* Win Probability Gauge */}
          <div className="flex flex-col items-center gap-3 py-4">
            <CircularGauge value={dispute.winProbability} size={140} />
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Win Probability</div>
              <div className={`text-xs font-bold uppercase tracking-widest mt-1 ${
                dispute.winProbability >= 70 ? 'text-[#22C55E]' : dispute.winProbability >= 40 ? 'text-[#F59E0B]' : 'text-[#9CA3AF]'
              }`}>{data?.confidence}</div>
            </div>
          </div>

          {/* Decision + Gating */}
          <div className="flex items-center gap-3">
            <DecisionBadge decision={dispute.decision} />
            <span className={`text-xs font-bold uppercase tracking-wide px-3 py-1 ${
              isAuto
                ? 'bg-[#0D0D0D] text-white'
                : 'bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]'
            }`}>
              {isAuto ? '● AUTO-DECIDED' : '⚠ ROUTED TO HUMAN'}
            </span>
          </div>

          {/* Feature Importance */}
          <div>
            <div className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D] mb-4 pb-2 border-b border-gray-100">
              Why the Model Chose {dispute.decision}
            </div>
            <div className="space-y-3">
              {data?.features.map(f => (
                <div key={f.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#0D0D0D]">{f.label}</span>
                    <span className="font-bold text-[#0D0D0D]">{f.value}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 overflow-hidden">
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${f.value}%`,
                        backgroundColor: f.value >= 50 ? '#EF4444' : '#9CA3AF',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Plain-language explanation */}
          <div className="bg-[#F7F7F8] border-l-4 border-[#EF4444] p-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] mb-2">Why This Decision</div>
            <p className="text-sm text-[#0D0D0D] leading-relaxed">{data?.explanation}</p>
          </div>

          {/* Dispute details */}
          <div className="border border-gray-100">
            <div className="bg-[#0D0D0D] px-4 py-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Dispute Details</span>
            </div>
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Amount</span>
                <span className="font-bold text-[#0D0D0D]">{dispute.amount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Reason Code</span>
                <span className="font-medium text-[#0D0D0D]">{dispute.reasonCode}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#6B7280]">Top Signal</span>
                <span className="text-[#0D0D0D] text-right max-w-[200px] text-xs leading-snug">{dispute.signals}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ── New Queue Modal ──────────────────────────────────────────────────────────
function NewQueueModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({
    name: '',
    reasonCodes: '',
    minConfidence: '70',
    priority: 'Medium',
    reviewer: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setError('Queue name is required.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      await api.createQueue({
        name: form.name,
        reasonCodes: form.reasonCodes,
        minConfidence: Number(form.minConfidence) || 70,
        priority: form.priority,
        reviewer: form.reviewer,
      })
      onCreated()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create queue.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass-modal w-full max-w-md mx-4 shadow-2xl">
        <div className="bg-[#0D0D0D] px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-white font-black text-sm uppercase tracking-widest">Create Review Queue</div>
            <div className="text-gray-500 text-xs mt-0.5">Configure automated dispute routing</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <IconX />
          </button>
        </div>
        <div className="h-0.5 bg-[#EF4444]" />
        <div className="p-6 space-y-4">
          {[
            { label: 'QUEUE NAME', key: 'name', placeholder: 'e.g. High-Value Product Disputes' },
            { label: 'REASON CODES', key: 'reasonCodes', placeholder: 'e.g. Product Not Received, Duplicate Charge' },
            { label: 'MINIMUM CONFIDENCE', key: 'minConfidence', placeholder: '70' },
            { label: 'ASSIGN REVIEWER', key: 'reviewer', placeholder: 'e.g. risk-team@acme.com' },
          ].map(({ label, key, placeholder }) => (
            <div key={key}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] mb-1.5">{label}</label>
              <input
                type="text"
                value={form[key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full border border-gray-200 px-3 py-2 text-sm text-[#0D0D0D] outline-none focus:border-[#EF4444] transition-colors"
                style={{ borderRadius: 0 }}
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] mb-1.5">PRIORITY</label>
            <select
              value={form.priority}
              onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full border border-gray-200 px-3 py-2 text-sm text-[#0D0D0D] outline-none focus:border-[#EF4444] bg-white"
              style={{ borderRadius: 0 }}
            >
              {['Low', 'Medium', 'High', 'Critical'].map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          {error && <p className="text-xs font-bold text-[#EF4444]">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-200 text-[#6B7280] hover:bg-gray-50 transition-colors btn-secondary">
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={submitting}
            className="px-5 py-2 text-xs font-black uppercase tracking-wider btn-primary text-white disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create Queue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Section Label ────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-[#EF4444]" />
        <h2 className="text-xl font-black uppercase tracking-tight text-[#0D0D0D]">{title}</h2>
      </div>
      {subtitle && <p className="text-sm text-[#6B7280] mt-1.5 ml-4">{subtitle}</p>}
    </div>
  )
}

// ── Dashboard Screen ─────────────────────────────────────────────────────────
function DashboardScreen({ disputes, metrics, revenue, onView }: {
  disputes: Dispute[]; metrics: ApiMetrics; revenue: ApiRevenue; onView: (d: Dispute) => void
}) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const filtered = filter === 'ALL' ? disputes : disputes.filter(d => d.decision === filter)
  const autoPct = metrics.total ? Math.round((metrics.autoDecided / metrics.total) * 1000) / 10 : 0

  return (
    <div className="p-8 space-y-10">
      {/* Command Center Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Command Center</h1>
          <p className="text-[#6B7280] text-sm mt-2">AI-powered dispute intelligence and automated chargeback decisions.</p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D]">Live • Model-scored queue</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div>
        <SectionHeader title="Key Metrics" />
        <div className="flex gap-4">
          <MetricCard label="Precision" value={`${metrics.precision}%`} trend="live" trendUp />
          <MetricCard label="Recall" value={`${metrics.recall}%`} trend="live" trendUp />
          <MetricCard label="F1 Score" value={`${metrics.f1}%`} trend="live" trendUp />
          <MetricCard label="Auto-Decided" value={`${metrics.autoDecided}/${metrics.total}`} sub={`${autoPct}% of cases`} trend="live" trendUp />
          <MetricCard label="Routed to Human Review" value={`${metrics.reviewRate}%`} trend="live" trendUp={false} />
        </div>
      </div>

      {/* Revenue Impact */}
      <div>
        <SectionHeader title="Revenue Impact" subtitle="Financial impact generated by AI-assisted dispute decisions." />
        <div className="grid grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">Recovered Value (Est.)</div>
            <div className="text-3xl font-black text-[#0D0D0D] mb-3">{revenue.recoveredValueDisplay}</div>
            <div className="flex items-center gap-2">
              <span className="text-[#22C55E] font-bold text-sm">↑ {revenue.captureRate}%</span>
              <span className="text-xs text-[#6B7280]">capture rate vs baseline</span>
            </div>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card" style={{ borderTop: '3px solid #EF4444' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">Total Fightable Amount at Stake</div>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-black text-[#0D0D0D]">{revenue.totalFightableDisplay}</div>
              <div className="text-[#EF4444]"><IconShield className="w-8 h-8" /></div>
            </div>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card" style={{ borderTop: '3px solid #EF4444' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-4">Capture Rate</div>
            <div className="flex items-center gap-6">
              <CircularGauge value={revenue.captureRate} size={90} />
              <div>
                <p className="text-xs text-[#6B7280] leading-relaxed">Recovery efficiency across winnable disputes</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-[#9CA3AF] mt-3">
          Baseline = merchant accepts every dispute. Recovered = winnable disputes correctly auto-fought by the agent.
        </p>
      </div>

      {/* Dispute Queue */}
      <div>
        <SectionHeader title="Dispute Queue" subtitle="Prioritized disputes requiring automated action or human review." />
        <div className="glass-table-wrapper">
          <div className="px-5 py-4 border-b border-gray-100/50 flex items-center justify-between">
            <FilterChips active={filter} onChange={setFilter} />
            <span className="text-xs text-[#6B7280] font-medium">{filtered.length} disputes</span>
          </div>
          <DisputeTable disputes={filtered} onView={onView} />
        </div>
      </div>
    </div>
  )
}

// ── Dispute Queue Screen ──────────────────────────────────────────────────────
function DisputeQueueScreen({ disputes, metrics, queues, onView }: {
  disputes: Dispute[]; metrics: ApiMetrics; queues: ApiReviewQueue[]; onView: (d: Dispute) => void
}) {
  const [filter, setFilter] = useState<FilterType>('ALL')
  const [activeQueueId, setActiveQueueId] = useState<number | null>(null)
  const humanReview = metrics.total - metrics.autoDecided

  const priorityColor: Record<string, string> = { High: '#EF4444', Medium: '#F59E0B', Low: '#6B7280' }
  const activeQueue = queues.find(q => q.id === activeQueueId) ?? null

  // Two independent filters stack together: the FIGHT/ACCEPT/REVIEW chips,
  // and (if selected) a review queue's routing rule — same matching logic
  // the backend uses to compute each queue's live count.
  const queueFiltered = activeQueue
    ? disputes.filter(d => {
        const codes = activeQueue.reasonCodes.split(',').map(c => c.trim()).filter(Boolean)
        const reasonMatch = codes.length === 0 || codes.includes(d.reasonCode)
        return reasonMatch && d.winProbability >= activeQueue.minConfidence
      })
    : disputes

  const filtered = filter === 'ALL' ? queueFiltered : queueFiltered.filter(d => d.decision === filter)

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Dispute Queue</h1>
        <p className="text-[#6B7280] text-sm mt-2">Prioritized disputes requiring automated action or human review.</p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TOTAL DISPUTES', value: String(metrics.total), color: '#EF4444' },
          { label: 'AUTO-DECIDED', value: String(metrics.autoDecided), color: '#22C55E' },
          { label: 'HUMAN REVIEW', value: String(humanReview), color: '#F59E0B' },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-100 shadow-sm p-5 stat-card" style={{ borderTop: `3px solid ${c.color}` }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{c.label}</div>
            <div className="text-3xl font-black text-[#0D0D0D]">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Review Queues — created via the "New Review Queue" button in the header */}
      <div>
        <SectionHeader
          title="Review Queues"
          subtitle="Click a queue to filter the table below to its matching disputes."
        />
        {queues.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-sm text-[#6B7280]">No review queues yet.</p>
            <p className="text-xs text-[#9CA3AF] mt-1">Click "New Review Queue" in the top-right header to create one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {queues.map(q => {
              const isActive = q.id === activeQueueId
              return (
                <button
                  key={q.id}
                  onClick={() => setActiveQueueId(isActive ? null : q.id)}
                  className="text-left bg-white border shadow-sm p-5 transition-all hover:shadow-md"
                  style={{
                    borderLeft: `3px solid ${priorityColor[q.priority] ?? '#6B7280'}`,
                    borderColor: isActive ? '#EF4444' : '#F3F4F6',
                    boxShadow: isActive ? '0 0 0 2px rgba(239,68,68,0.15)' : undefined,
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-black text-sm text-[#0D0D0D]">{q.name}</div>
                      <div className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mt-0.5">
                        {q.reasonCodes || 'All reason codes'} • ≥{q.minConfidence}% confidence
                      </div>
                    </div>
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2 py-1 shrink-0"
                      style={{ color: priorityColor[q.priority] ?? '#6B7280', backgroundColor: `${priorityColor[q.priority] ?? '#6B7280'}15` }}
                    >
                      {q.priority}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                    <span className="text-xs text-[#6B7280]">
                      {q.reviewer ? `Reviewer: ${q.reviewer}` : 'No reviewer assigned'}
                    </span>
                    <span className={`text-xs font-black ${isActive ? 'text-[#EF4444]' : 'text-[#0D0D0D]'}`}>
                      {isActive ? '✓ Filtering below' : `${q.matchingDisputes} open match${q.matchingDisputes === 1 ? '' : 'es'}`}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <div className="glass-table-wrapper">
        <div className="px-5 py-4 border-b border-gray-100/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FilterChips active={filter} onChange={setFilter} />
            {activeQueue && (
              <button
                onClick={() => setActiveQueueId(null)}
                className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-red-50 text-[#EF4444] px-3 py-1.5 hover:bg-red-100 transition-colors rounded-lg"
              >
                {activeQueue.name} <IconX className="w-3 h-3" />
              </button>
            )}
          </div>
          <span className="text-xs text-[#6B7280] font-medium">{filtered.length} of {disputes.length} disputes</span>
        </div>
        <DisputeTable disputes={filtered} onView={onView} />
      </div>
    </div>
  )
}

// ── Evidence Packets Screen ───────────────────────────────────────────────────
function EvidencePacketsScreen({ evidence, onSubmit }: { evidence: ApiEvidencePacket[]; onSubmit: (id: string) => Promise<void> }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Evidence Packets</h1>
        <p className="text-[#6B7280] text-sm mt-2">Submission-ready evidence bundles generated by the AI agent.</p>
      </div>
      <div className="space-y-3">
        {evidence.length === 0 ? (
          <div className="bg-white border border-gray-100 shadow-sm p-10 text-center text-[#6B7280] text-sm uppercase tracking-wider">
            No evidence packets yet — no disputes are currently marked FIGHT or REVIEW.
          </div>
        ) : evidence.map(packet => <EvidenceCard key={packet.id} packet={packet} onSubmit={onSubmit} />)}
      </div>
    </div>
  )
}

// ── Model Performance Screen ──────────────────────────────────────────────────
function ModelPerformanceScreen({ metrics }: { metrics: ApiMetrics }) {
  const { confusion } = metrics
  const barData = [
    { label: 'Auto-Decided', value: metrics.autoDecided, color: '#0D0D0D' },
    { label: 'Human Review', value: metrics.total - metrics.autoDecided, color: '#6B7280' },
    { label: 'Correctly Won', value: confusion.trueFight, color: '#22C55E' },
    { label: 'Incorrect', value: confusion.falseFight, color: '#EF4444' },
  ]
  const maxVal = Math.max(metrics.total, 1)

  const matrix = [
    { label: 'True Fight', value: confusion.trueFight, color: '#22C55E', desc: 'Correctly identified winnable disputes' },
    { label: 'False Fight', value: confusion.falseFight, color: '#EF4444', desc: 'Incorrectly fought unwinnable disputes' },
    { label: 'True Accept', value: confusion.trueAccept, color: '#22C55E', desc: 'Correctly accepted unwinnable disputes' },
    { label: 'False Accept', value: confusion.falseAccept, color: '#F59E0B', desc: 'Incorrectly accepted winnable disputes' },
  ]

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Model Performance</h1>
        <p className="text-[#6B7280] text-sm mt-2">AI model health metrics and decision accuracy analysis.</p>
      </div>

      {/* Health Cards */}
      <div className="flex gap-4">
        {[
          { label: 'Precision', value: `${metrics.precision}%` },
          { label: 'Recall', value: `${metrics.recall}%` },
          { label: 'F1 Score', value: `${metrics.f1}%` },
          { label: 'Accuracy', value: `${metrics.accuracy}%` },
        ].map(c => (
          <div key={c.label} className="bg-white border border-gray-100 shadow-sm flex-1 p-5 stat-card" style={{ borderTop: '3px solid #EF4444' }}>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{c.label}</div>
            <div className="text-3xl font-black text-[#0D0D0D]">{c.value}</div>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card">
        <div className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D] mb-6 pb-3 border-b border-gray-100">
          Dispute Decision Distribution
        </div>
        <div className="space-y-4">
          {barData.map(b => (
            <div key={b.label} className="flex items-center gap-4">
              <div className="text-xs font-medium text-[#6B7280] w-32 shrink-0">{b.label}</div>
              <div className="flex-1 h-7 bg-gray-100 relative overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 flex items-center px-3 transition-all duration-700"
                  style={{ width: `${(b.value / maxVal) * 100}%`, backgroundColor: b.color, minWidth: 40 }}
                >
                  <span className="text-white text-xs font-black">{b.value}</span>
                </div>
              </div>
              <div className="text-xs font-bold text-[#0D0D0D] w-12 text-right">{Math.round((b.value / maxVal) * 100)}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Confusion Matrix */}
      <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card">
        <div className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D] mb-6 pb-3 border-b border-gray-100">
          Confusion Matrix
        </div>
        <div className="grid grid-cols-2 gap-4">
          {matrix.map(m => (
            <div key={m.label} className="border border-gray-100 p-5 bg-white stat-card" style={{ borderLeft: `4px solid ${m.color}` }}>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#6B7280] mb-2">{m.label}</div>
              <div className="text-4xl font-black text-[#0D0D0D] mb-1">{m.value}</div>
              <div className="text-xs text-[#6B7280]">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Reason Code Rules Screen ──────────────────────────────────────────────────
function ReasonCodeRulesScreen({ rules }: { rules: ApiRule[] }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Reason Code Rules</h1>
        <p className="text-[#6B7280] text-sm mt-2">Evidence requirements and confidence thresholds per reason code.</p>
      </div>

      <div className="glass-table-wrapper">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '2px solid #EF4444' }}>
              {['REASON CODE', 'REQUIRED EVIDENCE', 'MIN CONFIDENCE', 'STATUS', 'ACTIONS'].map(col => (
                <th key={col} className="text-left py-3 px-5 text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={r.code} className={`border-b border-gray-100/50 ${i % 2 === 1 ? 'bg-white/30' : 'bg-white/55'} hover:bg-red-50/50 transition-colors`}>
                <td className="py-4 px-5 text-sm font-bold text-[#0D0D0D]">{r.code}</td>
                <td className="py-4 px-5 text-sm text-[#6B7280]">{r.evidence}</td>
                <td className="py-4 px-5 text-sm font-bold text-[#0D0D0D]">{r.confidence}</td>
                <td className="py-4 px-5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#22C55E] bg-green-50 border border-[#22C55E] px-2 py-0.5">
                    {r.status}
                  </span>
                </td>
                <td className="py-4 px-5">
                  <button className="text-[#6B7280] hover:text-[#EF4444] transition-colors">
                    <IconEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Settings Screen ───────────────────────────────────────────────────────────
function SettingsScreen({ thresholds, disputes, onSave }: {
  thresholds: ApiThresholds
  disputes: Dispute[]
  onSave: (fightThreshold: number, acceptThreshold: number) => Promise<void>
}) {
  const [fightThreshold, setFightThreshold] = useState(thresholds.fightThreshold)
  const [acceptThreshold, setAcceptThreshold] = useState(thresholds.acceptThreshold)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Client-side live preview using the currently loaded win probabilities -
  // gives instant slider feedback without a round trip. The Save button
  // triggers the real server-side retrain + re-score.
  const total = disputes.length || 1
  const autoCount = disputes.filter(d => d.winProbability >= fightThreshold || d.winProbability <= acceptThreshold).length
  const autoPct = Math.round((autoCount / total) * 100)
  const humanPct = 100 - autoPct

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      await onSave(fightThreshold, acceptThreshold)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-black uppercase tracking-tight text-[#0D0D0D] leading-none">Decision Settings</h1>
        <p className="text-[#6B7280] text-sm mt-2">Control how aggressively the AI agent automates dispute decisions.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="space-y-6">
          {/* Fight Threshold */}
          <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card" style={{ borderTop: '3px solid #22C55E' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D]">Fight Threshold</div>
              <div className="text-2xl font-black text-[#EF4444]">{fightThreshold}%</div>
            </div>
            <p className="text-xs text-[#6B7280] mb-5">Disputes above this probability can be automatically fought.</p>
            <input
              type="range"
              min={50} max={95} value={fightThreshold}
              onChange={e => setFightThreshold(Number(e.target.value))}
              style={{ '--range-pct': `${((fightThreshold - 50) / 45) * 100}%` } as React.CSSProperties}
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
              <span>50%</span><span>95%</span>
            </div>
          </div>

          {/* Accept Threshold */}
          <div className="bg-white border border-gray-100 shadow-sm p-6 stat-card" style={{ borderTop: '3px solid #9CA3AF' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D]">Accept Threshold</div>
              <div className="text-2xl font-black text-[#EF4444]">{acceptThreshold}%</div>
            </div>
            <p className="text-xs text-[#6B7280] mb-5">Disputes below this probability can be automatically accepted.</p>
            <input
              type="range"
              min={5} max={45} value={acceptThreshold}
              onChange={e => setAcceptThreshold(Number(e.target.value))}
              style={{ '--range-pct': `${((acceptThreshold - 5) / 40) * 100}%` } as React.CSSProperties}
            />
            <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
              <span>5%</span><span>45%</span>
            </div>
          </div>
        </div>

        {/* Live Preview */}
        <div className="glass-dark-box p-6 flex flex-col justify-between" style={{ minHeight: 280 }}>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Current Automation Profile</div>
            <p className="text-gray-400 text-xs mb-6">At current settings:</p>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-white text-xs font-medium uppercase tracking-wider">Auto-Decided</span>
                  <span className="text-[#EF4444] text-2xl font-black">{autoPct}%</span>
                </div>
                <div className="h-3 bg-white/10 overflow-hidden">
                  <div className="h-full bg-[#EF4444] transition-all duration-500" style={{ width: `${autoPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-white text-xs font-medium uppercase tracking-wider">Human Review</span>
                  <span className="text-gray-400 text-2xl font-black">{humanPct}%</span>
                </div>
                <div className="h-3 bg-white/10 overflow-hidden">
                  <div className="h-full bg-gray-500 transition-all duration-500" style={{ width: `${humanPct}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-start gap-3 text-xs text-gray-500">
              <span className="text-[#F59E0B] mt-0.5">⚠</span>
              <span>Raising the fight threshold reduces false positives but may miss winnable disputes.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-end gap-4">
        {saved && (
          <span className="text-xs font-bold uppercase tracking-widest text-[#22C55E]">
            ✓ Thresholds saved — model retrained
          </span>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 btn-primary text-white text-xs font-black uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving…' : 'Save Thresholds'}
        </button>
      </div>
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
interface NavItem {
  id: Screen
  label: string
  icon: React.ReactNode
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <IconGrid /> },
  { id: 'queue', label: 'Dispute Queue', icon: <IconDoc /> },
  { id: 'evidence', label: 'Evidence Packets', icon: <IconFileCheck /> },
  { id: 'performance', label: 'Model Performance', icon: <IconBarChart /> },
  { id: 'rules', label: 'Reason Code Rules', icon: <IconSliders /> },
  { id: 'settings', label: 'Settings', icon: <IconSettings /> },
]

function Sidebar({ active, onChange, user, onLogout }: {
  active: Screen; onChange: (s: Screen) => void; user: User; onLogout: () => void
}) {
  const initials = user.display_name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'ME'

  return (
    <div
      className="flex-shrink-0 flex flex-col h-full overflow-hidden"
      style={{ width: 240, background: 'linear-gradient(180deg, #131313 0%, #0D0D0D 40%, #0A0A0A 100%)' }}
    >
      <div className="flex-1 py-6 overflow-y-auto scrollbar-hide">
        <nav className="px-3 space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = item.id === active
            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium transition-all group ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-200'
                }`}
                style={{
                  backgroundColor: isActive ? 'rgba(255,255,255,0.07)' : 'transparent',
                  borderLeft: isActive ? '3px solid #EF4444' : '3px solid transparent',
                }}
              >
                <span className={`${isActive ? 'text-[#EF4444]' : 'text-gray-600 group-hover:text-[#EF4444]'} transition-colors`}>
                  {item.icon}
                </span>
                <span className={`font-${isActive ? 'bold' : 'medium'} text-[13px] uppercase tracking-wide`}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Merchant profile */}
      <div className="px-4 py-5 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#EF4444] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-black">{initials}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-white text-xs font-black uppercase tracking-wider truncate">{user.display_name}</div>
            <div className="text-gray-500 text-[10px] tracking-wide">@{user.username}</div>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="text-gray-600 hover:text-[#EF4444] transition-colors shrink-0"
          >
            <IconLogout className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Notifications Dropdown ────────────────────────────────────────────────────
function timeAgo(iso: string): string {
  // Defensive: never let a malformed/missing timestamp crash the render -
  // this exact bug (an undefined value reaching new Date()) is why the
  // notifications button previously blanked the whole page.
  if (!iso) return ''
  const parsed = new Date(iso.includes('T') ? iso : iso.replace(' ', 'T') + 'Z')
  if (Number.isNaN(parsed.getTime())) return ''
  const diffMs = Date.now() - parsed.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const NOTIFICATION_ICON: Record<string, string> = {
  threshold: '⚙️', queue: '📋', system: '🔄', account: '👋', submission: '✅',
}

function NotificationsDropdown({ notifications, onClose, onMarkRead, onMarkAllRead }: {
  notifications: Notification[]
  onClose: () => void
  onMarkRead: (id: number) => void
  onMarkAllRead: () => void
}) {
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-96 bg-white shadow-2xl border border-gray-100 z-50" style={{ borderRadius: 4 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <span className="text-[11px] font-black uppercase tracking-widest text-[#0D0D0D]">
            Notifications {unreadCount > 0 && <span className="text-[#EF4444]">({unreadCount})</span>}
          </span>
          {unreadCount > 0 && (
            <button onClick={onMarkAllRead} className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] hover:text-[#EF4444] transition-colors">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[#9CA3AF] uppercase tracking-wider">No notifications yet</div>
          ) : notifications.map(n => (
            <button
              key={n.id}
              onClick={() => onMarkRead(n.id)}
              className={`w-full text-left px-5 py-3.5 border-b border-gray-50 flex gap-3 items-start hover:bg-gray-50 transition-colors ${!n.read ? 'bg-red-50/40' : ''}`}
            >
              <span className="text-base shrink-0 mt-0.5">{NOTIFICATION_ICON[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-xs leading-relaxed ${!n.read ? 'font-semibold text-[#0D0D0D]' : 'text-[#6B7280]'}`}>{n.message}</p>
                <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">{timeAgo(n.created_at)}</span>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-[#EF4444] shrink-0 mt-1" />}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

// ── Search Overlay ────────────────────────────────────────────────────────────
function SearchOverlay({ disputes, onSelect, onClose }: {
  disputes: Dispute[]; onSelect: (d: Dispute) => void; onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLowerCase()
  const results = q === '' ? [] : disputes.filter(d =>
    d.id.toLowerCase().includes(q) ||
    d.reasonCode.toLowerCase().includes(q) ||
    d.signals.toLowerCase().includes(q) ||
    d.decision.toLowerCase().includes(q)
  ).slice(0, 12)

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" style={{ backgroundColor: 'rgba(13,13,13,0.6)' }} onClick={onClose}>
      <div className="w-full max-w-xl bg-white shadow-2xl" style={{ borderRadius: 4 }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <IconSearch className="w-4 h-4 text-[#9CA3AF]" />
          <input
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') onClose() }}
            placeholder="Search disputes by ID, reason code, or signal…"
            className="flex-1 text-sm outline-none placeholder:text-[#9CA3AF]"
          />
          <button onClick={onClose} className="text-[#9CA3AF] hover:text-[#0D0D0D] transition-colors">
            <IconX className="w-4 h-4" />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {q === '' ? (
            <div className="px-5 py-10 text-center text-xs text-[#9CA3AF] uppercase tracking-wider">
              Start typing to search the dispute queue
            </div>
          ) : results.length === 0 ? (
            <div className="px-5 py-10 text-center text-xs text-[#9CA3AF] uppercase tracking-wider">No matches found</div>
          ) : results.map(d => (
            <button
              key={d.id}
              onClick={() => { onSelect(d); onClose() }}
              className="w-full text-left px-5 py-3.5 border-b border-gray-50 hover:bg-gray-50 transition-colors flex items-center justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-sm text-[#0D0D0D]">{d.id}</span>
                  <DecisionBadge decision={d.decision} />
                </div>
                <p className="text-xs text-[#6B7280] mt-1 truncate">{d.reasonCode} • {d.amount}</p>
              </div>
              <span className="text-xs font-bold text-[#6B7280] shrink-0">{d.winProbability}%</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Loading / Error States ──────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="flex h-screen items-center justify-center app-bg">
      <div className="flex flex-col items-center gap-4">
        <span className="text-[#EF4444] animate-pulse"><IconShield className="w-10 h-10" /></span>
        <span className="text-[11px] font-black uppercase tracking-widest text-[#6B7280]">
          Loading dispute intelligence…
        </span>
      </div>
    </div>
  )
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center app-bg">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <span className="text-[#EF4444]"><IconX className="w-10 h-10" /></span>
        <span className="text-sm font-bold text-[#0D0D0D]">Couldn't reach the backend</span>
        <p className="text-xs text-[#6B7280]">{message}</p>
        <button
          onClick={onRetry}
          className="px-5 py-2 text-xs font-black uppercase tracking-widest btn-primary text-white"
        >
          Retry
        </button>
      </div>
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  // ── Auth / view flow ──────────────────────────────────────────────────────
  const [view, setView] = useState<'landing' | 'login' | 'app'>('landing')
  const [user, setUser] = useState<User | null>(null)

  const [screen, setScreen] = useState<Screen>('dashboard')
  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const [data, setData] = useState<Bootstrap | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadData = useCallback(async () => {
    setError(null)
    try {
      const [bootstrap, notifs] = await Promise.all([api.getBootstrap(), api.getNotifications()])
      setData(bootstrap)
      setNotifications(notifs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error loading dashboard data.')
    } finally {
      setLoading(false)
    }
  }, [])

  // On initial load: always present the main landing/home page with background image first.
  useEffect(() => {
    setView('landing')
  }, [])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const [bootstrap, notifs] = await Promise.all([api.getBootstrap(), api.getNotifications()])
      setData(bootstrap)
      setNotifications(notifs)
    } finally {
      setRefreshing(false)
    }
  }, [])

  // Poll for updates every 15s while the dashboard is open — mirrors a real
  // production app where other reviewers/webhooks can change data
  // server-side at any time. Silent (no spinner) so it doesn't feel jumpy;
  // the header's small "Syncing…" indicator only shows for user-triggered
  // refreshes (save thresholds, create queue, etc).
  useEffect(() => {
    if (view !== 'app') return
    const interval = setInterval(() => {
      Promise.all([api.getBootstrap(), api.getNotifications()])
        .then(([bootstrap, notifs]) => {
          setData(bootstrap)
          setNotifications(notifs)
        })
        .catch(() => {
          // A transient network hiccup shouldn't nuke a working dashboard -
          // just skip this tick and try again on the next interval.
        })
    }, 15000)
    return () => clearInterval(interval)
  }, [view])

  const handleSaveThresholds = useCallback(async (fightThreshold: number, acceptThreshold: number) => {
    const updated = await api.updateThresholds(fightThreshold, acceptThreshold)
    setData(updated)
    api.getNotifications().then(setNotifications)
  }, [])

  const handleSubmitPacket = useCallback(async (id: string) => {
    const updated = await api.submitDispute(id)
    setData(updated)
    api.getNotifications().then(setNotifications)
  }, [])

  const handleAuthSuccess = useCallback((loggedInUser: User) => {
    setUser(loggedInUser)
    setView('app')
    setLoading(true)
    loadData()
  }, [loadData])

  const handleLogout = useCallback(async () => {
    await api.logout()
    setUser(null)
    setData(null)
    setLoading(true)
    setView('landing')
  }, [])

  const handleMarkNotifRead = useCallback((id: number) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: 1 } : n)))
    api.markNotificationRead(id)
  }, [])

  const handleMarkAllNotifRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })))
    api.markAllNotificationsRead()
  }, [])

  // ── Auth screens ──────────────────────────────────────────────────────────
  if (view === 'landing') {
    return <Landing onLogin={() => setView('login')} onGetStarted={() => setView('login')} />
  }
  if (view === 'login') {
    return <Login onSuccess={handleAuthSuccess} onBack={() => setView('landing')} />
  }

  // ── Authenticated app ─────────────────────────────────────────────────────
  if (loading) return <LoadingScreen />
  if (error || !data || !user) return <ErrorScreen message={error ?? 'No data returned.'} onRetry={loadData} />

  const unreadCount = notifications.filter(n => !n.read).length

  const screenMap: Record<Screen, React.ReactNode> = {
    dashboard: (
      <DashboardScreen
        disputes={data.disputes}
        metrics={data.metrics}
        revenue={data.revenue}
        onView={setSelectedDispute}
      />
    ),
    queue: (
      <DisputeQueueScreen disputes={data.disputes} metrics={data.metrics} queues={data.queues} onView={setSelectedDispute} />
    ),
    evidence: <EvidencePacketsScreen evidence={data.evidence} onSubmit={handleSubmitPacket} />,
    performance: <ModelPerformanceScreen metrics={data.metrics} />,
    rules: <ReasonCodeRulesScreen rules={data.rules} />,
    settings: (
      <SettingsScreen thresholds={data.thresholds} disputes={data.disputes} onSave={handleSaveThresholds} />
    ),
  }

  return (
    <div className="flex h-screen overflow-hidden app-bg" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <Sidebar active={screen} onChange={setScreen} user={user} onLogout={handleLogout} />

      {/* Right side: header + content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header */}
        <header className="shrink-0 flex items-center justify-between px-6" style={{ height: 72, background: 'linear-gradient(180deg, #141414 0%, #0D0D0D 100%)' }}>
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="text-[#EF4444]"><IconShield className="w-6 h-6" /></span>
            <span className="text-white font-black text-base uppercase tracking-widest" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Chargeback Shield
            </span>
            {refreshing && (
              <span className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">Syncing…</span>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-4">
            <button onClick={() => setSearchOpen(true)} className="text-gray-500 hover:text-white transition-colors">
              <IconSearch />
            </button>
            <div className="relative">
              <button
                onClick={() => setNotifOpen(o => !o)}
                className="text-gray-500 hover:text-white transition-colors relative"
              >
                <IconBell />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#EF4444] rounded-full" />
                )}
              </button>
              {notifOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  onClose={() => setNotifOpen(false)}
                  onMarkRead={handleMarkNotifRead}
                  onMarkAllRead={handleMarkAllNotifRead}
                />
              )}
            </div>
            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 btn-primary text-white px-4 py-2 text-[11px] font-black uppercase tracking-widest"
            >
              <IconPlus />
              New Review Queue
            </button>
          </div>
        </header>

        {/* Red accent line */}
        <div className="shrink-0 h-0.5 bg-[#EF4444]" />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto app-bg">
          {screenMap[screen]}

          {/* Footer */}
          <footer className="bg-[#0D0D0D] mt-8 px-8 py-5 flex items-center justify-between">
            <span className="text-white font-black text-xs uppercase tracking-widest" style={{ fontFamily: "'Manrope', sans-serif" }}>
              Chargeback Shield
            </span>
            <div className="flex items-center gap-6">
              <span className="text-gray-600 text-[10px] uppercase tracking-widest">AI Dispute Intelligence • Merchant Protection</span>
              <span className="text-gray-700 text-[10px] font-mono">v1.0.0</span>
            </div>
          </footer>
        </main>
      </div>

      {/* Explainability Panel */}
      <ExplainabilityPanel dispute={selectedDispute} onClose={() => setSelectedDispute(null)} />

      {/* New Queue Modal */}
      {modalOpen && (
        <NewQueueModal
          onClose={() => setModalOpen(false)}
          onCreated={async () => {
            await refresh()
            setScreen('queue')
          }}
        />
      )}

      {/* Search Overlay */}
      {searchOpen && (
        <SearchOverlay
          disputes={data.disputes}
          onSelect={setSelectedDispute}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  )
}
