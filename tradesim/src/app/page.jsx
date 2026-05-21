import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AuthForm from '@/components/AuthForm'
import { TrendingUp, Zap, Trophy, Bot } from 'lucide-react'

export default async function LandingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/dashboard')

  const features = [
    {
      icon: <Zap size={20} className="text-yellow-400" />,
      title: 'Live Price Feeds',
      body: 'Real-time BTC, ETH, AAPL, TSLA & NVDA prices. Refreshes every 3 seconds.',
    },
    {
      icon: <TrendingUp size={20} className="text-bull" />,
      title: 'Paper Trading Engine',
      body: 'Go long or short. Real-time P&L, margin tracking, full trade history.',
    },
    {
      icon: <Trophy size={20} className="text-yellow-400" />,
      title: 'Live Leaderboard',
      body: 'Supabase real-time — rankings update instantly for every player.',
    },
    {
      icon: <Bot size={20} className="text-accent" />,
      title: 'AI Momentum Bot',
      body: '20-period moving average strategy. Trades automatically and competes on the leaderboard.',
    },
  ]

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          <span className="font-bold text-white text-lg">TradeSim</span>
        </div>
        <span className="text-xs text-muted">$0/month · 100% free to deploy</span>
      </nav>

      <div className="flex flex-col lg:flex-row flex-1 max-w-6xl mx-auto w-full px-6 py-16 gap-16 items-start">
        {/* Left: hero + features */}
        <div className="flex-1 space-y-10">
          <div>
            <h1 className="text-4xl font-extrabold text-white leading-tight">
              Paper Trading.<br />
              <span className="text-accent">Real Competition.</span>
            </h1>
            <p className="mt-4 text-muted text-lg max-w-lg">
              Start with <span className="text-white font-semibold">$100,000 virtual cash</span>.
              Trade BTC, ETH, and US stocks with live prices. Beat the AI bot. Top the leaderboard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map(f => (
              <div key={f.title} className="bg-panel border border-border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  {f.icon}
                  <span className="font-semibold text-white text-sm">{f.title}</span>
                </div>
                <p className="text-muted text-sm">{f.body}</p>
              </div>
            ))}
          </div>

          <div className="text-xs text-muted border border-border rounded-lg p-4 space-y-1">
            <p className="font-semibold text-white text-sm mb-2">Stack — all free tiers</p>
            <p>• <span className="text-white">Next.js</span> on Vercel — frontend + API routes</p>
            <p>• <span className="text-white">Supabase</span> — database, auth, real-time subscriptions</p>
            <p>• <span className="text-white">CoinGecko</span> — BTC/ETH prices (no key needed)</p>
            <p>• <span className="text-white">Alpaca</span> — AAPL/TSLA/NVDA prices (free account)</p>
            <p>• <span className="text-white">TradingView</span> — embeddable chart widget (free)</p>
          </div>
        </div>

        {/* Right: auth form */}
        <div className="w-full lg:w-96">
          <AuthForm />
        </div>
      </div>
    </main>
  )
}
