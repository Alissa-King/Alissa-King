'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { usePrices } from '@/hooks/usePrices'
import { usePortfolio } from '@/hooks/usePortfolio'
import Chart from '@/components/Chart'
import PriceTicker from '@/components/PriceTicker'
import TradeForm from '@/components/TradeForm'
import OpenTrades from '@/components/OpenTrades'
import PortfolioStats from '@/components/PortfolioStats'
import Leaderboard from '@/components/Leaderboard'
import AIBotPanel from '@/components/AIBotPanel'
import { TrendingUp, Trophy, LogOut } from 'lucide-react'

const ASSETS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'NVDA']

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [chartAsset, setChartAsset] = useState('BTC/USD')
  const [view, setView] = useState('trade') // 'trade' | 'leaderboard'
  const router = useRouter()
  const supabase = createClient()
  const { prices, direction } = usePrices()
  const { portfolio, openTrades, closedTrades, loading, refresh } = usePortfolio(user?.id)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/'); return }
      setUser(user)
    })
  }, [])

  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-muted text-sm">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-panel px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-accent" />
          <span className="font-bold text-white">TradeSim</span>
        </div>

        {/* Asset tabs */}
        <div className="flex gap-1 ml-4 overflow-x-auto">
          {ASSETS.map(a => (
            <button
              key={a}
              onClick={() => setChartAsset(a)}
              className={`px-3 py-1.5 rounded text-xs font-mono font-medium whitespace-nowrap transition-colors ${
                chartAsset === a
                  ? 'bg-accent text-white'
                  : 'text-muted hover:text-white hover:bg-surface'
              }`}
            >
              {a}
            </button>
          ))}
        </div>

        {/* Mobile view toggle */}
        <div className="ml-auto flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setView('trade')}
            className={`text-xs px-3 py-1.5 rounded ${view === 'trade' ? 'bg-accent text-white' : 'text-muted'}`}
          >
            Trade
          </button>
          <button
            onClick={() => setView('leaderboard')}
            className={`text-xs px-3 py-1.5 rounded ${view === 'leaderboard' ? 'bg-accent text-white' : 'text-muted'}`}
          >
            <Trophy size={12} />
          </button>
        </div>

        <button
          onClick={signOut}
          className="hidden lg:flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </header>

      {/* Price ticker */}
      <PriceTicker />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: chart + trades */}
        <div className={`flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-w-0 ${view === 'leaderboard' ? 'hidden lg:flex' : ''}`}>
          <PortfolioStats
            portfolio={portfolio}
            openTrades={openTrades}
            closedTrades={closedTrades}
            prices={prices}
          />
          <Chart asset={chartAsset} />
          <OpenTrades trades={openTrades} prices={prices} onClose={refresh} />
        </div>

        {/* Right sidebar */}
        <div className={`w-full lg:w-80 flex flex-col gap-4 p-4 border-l border-border overflow-y-auto shrink-0 ${view === 'trade' ? 'hidden lg:flex' : ''}`}>
          <TradeForm
            prices={prices}
            balance={portfolio?.balance ?? 0}
            onTrade={refresh}
          />
          <AIBotPanel prices={prices} />
          <Leaderboard currentUserId={user.id} compact />
        </div>
      </div>
    </div>
  )
}
