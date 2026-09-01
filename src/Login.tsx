import { useState } from 'react'
import { api } from './api'
import type { User } from './api'

interface LoginProps {
  onSuccess: (user: User) => void
  onBack: () => void
}

function IconShield({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2 L20 6 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V6 Z" strokeLinejoin="round" />
      <path d="M9 12 L11 14 L15 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Login({ onSuccess, onBack }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const user =
        mode === 'login'
          ? await api.login(username, password)
          : await api.register(username, password, displayName || username)
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemoLogin = async () => {
    setError(null)
    setSubmitting(true)
    try {
      let user: User
      try {
        user = await api.login('demo', 'demo1234')
      } catch {
        user = await api.register('demo', 'demo1234', 'Demo Merchant')
      }
      onSuccess(user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Demo login failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#08080A' }}>
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
            'radial-gradient(ellipse 70% 60% at 15% 85%, rgba(239,68,68,0.25), transparent 60%), ' +
            'radial-gradient(ellipse 70% 60% at 85% 15%, rgba(239,68,68,0.15), transparent 60%), ' +
            'linear-gradient(180deg, rgba(8,8,12,0.45) 0%, rgba(6,6,10,0.55) 60%, rgba(4,4,8,0.70) 100%)',
        }}
      />
      <div
        className="absolute -bottom-40 -left-20 w-[450px] h-[450px] rounded-full opacity-25 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #EF4444, transparent 70%)', animation: 'floatA 16s ease-in-out infinite' }}
      />
      <div
        className="absolute -top-32 -right-24 w-[500px] h-[500px] rounded-full opacity-20 blur-[130px]"
        style={{ background: 'radial-gradient(circle, #EF4444, transparent 70%)', animation: 'floatB 20s ease-in-out infinite' }}
      />
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
        }}
      />
      <style>{`
        @keyframes floatA { 0%,100% { transform: translate(0,0); } 50% { transform: translate(35px,-45px); } }
        @keyframes floatB { 0%,100% { transform: translate(0,0); } 50% { transform: translate(-40px,50px); } }
      `}</style>

      <div className="relative z-10 w-full max-w-md px-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md text-gray-300 hover:text-white text-xs font-bold uppercase tracking-widest mb-8 transition-all hover:bg-white/20 shadow-md"
        >
          ← Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <span className="text-[#EF4444]"><IconShield className="w-7 h-7" /></span>
          <span className="text-white font-black text-lg uppercase tracking-widest drop-shadow-md">Chargeback Shield</span>
        </div>

        {/* Translucent glass card container */}
        <div className="backdrop-blur-2xl bg-black/40 border border-white/20 rounded-2xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#EF4444]/50 to-transparent" />
          
          <div className="flex border-b border-white/15 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'login' ? 'text-white border-b-2 border-[#EF4444]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 pb-3 text-xs font-black uppercase tracking-widest transition-all ${
                mode === 'register' ? 'text-white border-b-2 border-[#EF4444]' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">
                  Merchant / Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Acme Commerce"
                  className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 text-white placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all"
                />
              </div>
            )}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                minLength={3}
                className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 text-white placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-300 block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white/[0.06] backdrop-blur-md border border-white/20 text-white placeholder:text-gray-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444] transition-all"
              />
            </div>

            {error && <p className="text-xs font-bold text-[#EF4444]">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#EF4444] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-600 hover:shadow-[0_0_24px_rgba(239,68,68,0.5)] transition-all duration-300 disabled:opacity-50"
            >
              {submitting ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-white/10 text-center">
            <button
              onClick={handleDemoLogin}
              disabled={submitting}
              className="text-xs font-bold uppercase tracking-widest text-gray-300 hover:text-[#EF4444] transition-colors disabled:opacity-50"
            >
              Skip → Use Demo Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
