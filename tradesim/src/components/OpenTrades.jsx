'use client'
import { useState } from 'react'
import { calcPnL, calcPnLPercent, fmtCurrency, fmtPrice } from '@/lib/tradeEngine'
import { X, TrendingUp, TrendingDown } from 'lucide-react'

function TradeRow({ trade, prices, onClose }) {
  const [closing, setClosing] = useState(false)
  const currentPrice = prices[trade.asset]?.price
  const pnl = currentPrice ? calcPnL(trade, currentPrice) : null
  const pnlPct = currentPrice ? calcPnLPercent(trade, currentPrice) : null
  const isUp = (pnl ?? 0) >= 0

  async function close() {
    if (closing) return
    setClosing(true)
    try {
      await fetch(`/api/trades/${trade.id}`, { method: 'DELETE' })
      onClose?.()
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-0 hover:bg-surface/60 transition-colors">
      {/* Direction badge */}
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
        trade.direction === 'long'
          ? 'bg-bull/10 text-bull border border-bull/30'
          : 'bg-bear/10 text-bear border border-bear/30'
      }`}>
        {trade.direction === 'long' ? '▲ LONG' : '▼ SHORT'}
      </span>

      {/* Asset + size */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{trade.asset}</p>
        <p className="text-xs text-muted font-mono">
          {fmtCurrency(trade.amount)} @ {fmtPrice(trade.entry_price)}
        </p>
      </div>

      {/* Current price */}
      <div className="text-right hidden sm:block">
        <p className="text-xs text-muted">Current</p>
        <p className="text-sm font-mono text-white">
          {currentPrice ? fmtPrice(currentPrice) : '—'}
        </p>
      </div>

      {/* P&L */}
      <div className="text-right w-24">
        <p className={`text-sm font-bold font-mono ${isUp ? 'text-bull' : 'text-bear'}`}>
          {pnl !== null ? `${isUp ? '+' : ''}${fmtCurrency(pnl)}` : '—'}
        </p>
        {pnlPct !== null && (
          <p className={`text-xs font-mono flex items-center justify-end gap-0.5 ${isUp ? 'text-bull' : 'text-bear'}`}>
            {isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
          </p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={close}
        disabled={closing}
        className="p-1.5 rounded text-muted hover:text-bear hover:bg-bear/10 transition-colors disabled:opacity-50"
        title="Close trade"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default function OpenTrades({ trades, prices, onClose }) {
  if (!trades.length) {
    return (
      <div className="bg-panel border border-border rounded-lg p-8 text-center text-muted text-sm">
        No open positions. Place a trade to start competing.
      </div>
    )
  }

  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Open Positions</h3>
        <span className="text-xs text-muted bg-surface px-2 py-0.5 rounded-full">{trades.length}</span>
      </div>
      {trades.map(t => (
        <TradeRow key={t.id} trade={t} prices={prices} onClose={onClose} />
      ))}
    </div>
  )
}
