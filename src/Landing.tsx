interface LandingProps {
  onLogin: () => void
  onGetStarted: () => void
}

function IconShield({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 L20 6 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V6 Z" strokeLinejoin="round" />
      <path d="M9 12 L11 14 L15 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Landing({ onLogin, onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
      {/* ── Background: Cyber Shield image + gradient overlays ── */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80"
        style={{
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/thumbnails/072/929/634/small/human-hand-pointing-at-a-digital-shield-and-padlock-on-a-dark-blue-background-representing-data-protection-and-cybersecurity-with-a-futuristic-and-secure-feeling-symbolizing-trust-and-reliability-photo.jpg')",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 15% 10%, rgba(239,68,68,0.25), transparent 60%), ' +
            'radial-gradient(ellipse 70% 60% at 90% 30%, rgba(239,68,68,0.15), transparent 60%), ' +
            'linear-gradient(180deg, rgba(8,8,12,0.45) 0%, rgba(6,6,10,0.55) 50%, rgba(4,4,8,0.70) 100%)',
        }}
      />
      {/* Subtle drifting glow orbs for depth/movement */}
      <div
        className="absolute -top-32 -left-20 w-[500px] h-[500px] rounded-full opacity-30 blur-[120px]"
        style={{ background: 'radial-gradient(circle, #EF4444, transparent 70%)', animation: 'float1 14s ease-in-out infinite' }}
      />
      <div
        className="absolute top-1/3 -right-32 w-[600px] h-[600px] rounded-full opacity-20 blur-[140px]"
        style={{ background: 'radial-gradient(circle, #EF4444, transparent 70%)', animation: 'float2 18s ease-in-out infinite' }}
      />
      {/* Fine grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      {/* Grain/noise for a less flat, more "photographic" feel */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-overlay pointer-events-none">
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" /></filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>

      <style>{`
        @keyframes float1 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(40px,60px); } }
        @keyframes float2 { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-50px,-40px); } }
      `}</style>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <span className="text-[#EF4444]"><IconShield className="w-7 h-7" /></span>
          <span className="text-white font-black text-lg uppercase tracking-widest">Chargeback Shield</span>
        </div>
        <button
          onClick={onLogin}
          className="px-6 py-2.5 border border-white/20 text-white text-xs font-black uppercase tracking-widest rounded-xl backdrop-blur-xl bg-white/10 hover:bg-white/20 hover:border-white/40 transition-all duration-300 shadow-lg"
        >
          Log In
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pt-20 pb-28 text-center">
        <div className="inline-flex items-center gap-2 border border-[#EF4444]/40 bg-[#EF4444]/15 backdrop-blur-xl px-5 py-2 rounded-full mb-8 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
          <span className="text-[#EF4444] text-[11px] font-black uppercase tracking-widest">AI Risk Manager · Razorpay Buildathon</span>
        </div>
        <h1 className="text-6xl md:text-7xl font-black uppercase text-white leading-[0.95] tracking-tight mb-6 drop-shadow-[0_4px_32px_rgba(0,0,0,0.8)]">
          Stop losing revenue<br />to <span className="text-[#EF4444]">chargebacks</span>.
        </h1>
        <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
          An AI agent that triages every dispute, decides whether to fight or accept,
          and assembles submission-ready evidence — explainable, bounded, and gated
          so nothing gets auto-submitted blind.
        </p>

        {/* Translucent glass card containing CTAs */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-3.5 backdrop-blur-2xl bg-black/40 border border-white/20 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.6)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#EF4444]/50 to-transparent" />
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#EF4444] text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:shadow-[0_0_24px_rgba(239,68,68,0.6)] transition-all duration-300"
          >
            Get Started
          </button>
          <button
            onClick={onLogin}
            className="w-full sm:w-auto px-8 py-3.5 border border-white/20 bg-white/5 backdrop-blur-md text-white text-sm font-black uppercase tracking-widest rounded-xl hover:bg-white/15 hover:border-white/40 transition-all duration-300"
          >
            Log In
          </button>
        </div>
      </div>

      {/* Feature strip — translucent glass panels */}
      <div className="relative z-10 max-w-5xl mx-auto px-8 pb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Explainable', desc: 'Every decision shows the exact signals behind it — no black box.' },
          { title: 'Bounded', desc: 'Uncertain cases route to a human instead of guessing.' },
          { title: 'Gated', desc: 'Incomplete evidence never gets auto-submitted.' },
        ].map(f => (
          <div
            key={f.title}
            className="backdrop-blur-2xl bg-black/40 border border-white/15 rounded-2xl p-6 text-left hover:bg-black/60 hover:border-[#EF4444]/50 transition-all duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-[#EF4444]/40 transition-all" />
            <div className="text-[#EF4444] text-xs font-black uppercase tracking-widest mb-2 group-hover:scale-105 transition-transform inline-block">{f.title}</div>
            <p className="text-gray-300 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      <footer className="relative z-10 border-t border-white/10 py-6 text-center backdrop-blur-sm">
        <span className="text-gray-500 text-[10px] uppercase tracking-widest">AI Dispute Intelligence · Merchant Protection</span>
      </footer>
    </div>
  )
}
