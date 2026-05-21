'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, TrendingUp } from 'lucide-react'

export default function AuthForm() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function submit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username: username || email.split('@')[0] } },
        })
        if (error) throw error
        setMessage('Check your email to confirm your account, then sign in.')
        setMode('login')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/dashboard')
        router.refresh()
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Tabs */}
      <div className="flex bg-panel border border-border rounded-t-lg overflow-hidden">
        {['login', 'signup'].map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setError('') }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === m
                ? 'bg-accent text-white'
                : 'text-muted hover:text-white'
            }`}
          >
            {m === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="bg-panel border border-t-0 border-border rounded-b-lg p-6 space-y-4">
        {mode === 'signup' && (
          <div>
            <label className="text-xs text-muted block mb-1.5">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="trader_xyz"
              className="w-full bg-surface border border-border text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-accent"
            />
          </div>
        )}
        <div>
          <label className="text-xs text-muted block mb-1.5">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full bg-surface border border-border text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs text-muted block mb-1.5">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full bg-surface border border-border text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-accent"
          />
        </div>

        {error && <p className="text-bear text-sm">{error}</p>}
        {message && <p className="text-bull text-sm">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-accent text-white font-semibold text-sm hover:bg-accent/80 transition-colors disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Create Account & Get $100K'}
        </button>

        {mode === 'login' && (
          <p className="text-center text-xs text-muted">
            No account?{' '}
            <button type="button" onClick={() => setMode('signup')} className="text-accent hover:underline">
              Sign up free
            </button>
          </p>
        )}
      </form>
    </div>
  )
}
