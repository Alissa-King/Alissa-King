'use client'
import { usePrices } from '@/hooks/usePrices'
import { fmtPrice } from '@/lib/tradeEngine'
import { TrendingUp, TrendingDown } from 'lucide-react'

const ASSETS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'NVDA']

function TickerItem({ asset, data, dir }) {
  const isUp = (data?.change24h ?? 0) >= 0
  const flash = dir === 'up' ? 'animate-flash-up' : dir === 'down' ? 'animate-flash-down' : ''

  return (
    <span className={`inline-flex items-center gap-2 px-6 py-1 ${flash}`}>
      <span className="text-muted text-xs font-mono">{asset}</span>
      <span className="text-white font-mono font-semibold text-sm">
        {data ? fmtPrice(data.price) : '—'}
      </span>
      {data && (
        <span className={`text-xs font-mono flex items-center gap-0.5 ${isUp ? 'text-bull' : 'text-bear'}`}>
          {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {isUp ? '+' : ''}{data.change24h?.toFixed(2)}%
        </span>
      )}
    </span>
  )
}

export default function PriceTicker() {
  const { prices, direction } = usePrices()

  const items = ASSETS.map(a => (
    <TickerItem key={a} asset={a} data={prices[a]} dir={direction(a)} />
  ))

  return (
    <div className="border-b border-border bg-panel overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap">
        {/* duplicate list for seamless loop */}
        {items}
        {items}
      </div>
    </div>
  )
}
