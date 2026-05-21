'use client'
import { useState } from 'react'
import { fmtPrice } from '@/lib/tradeEngine'
import { Loader2 } from 'lucide-react'

const ASSETS = ['BTC/USD', 'ETH/USD', 'AAPL', 'TSLA', 'NVDA']
const QUICK_AMOUNTS = [1000, 5000, 10000, 25000]

export default function TradeForm({ prices, balance, onTrade }) {
  const [asset, setAsset] = useState('BTC/USD')
  const [amount, setAmount] = useState(1000)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const currentPrice = prices[asset]?.price

  async function place(direction) {
    if (submitting) return
    if (amount <= 0) return setError('Enter a valid amount')
    if (amount > balance) return setError('Insufficient balance')
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/trades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, direction, amount }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Trade failed')
      onTrade?.(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-panel border border-border rounded-lg p-5 space-y-4">
      <h2 className="text-sm font-semibold text-white uppercase tracking-wide">Place Trade</h2>

      {/* Asset selector */}
      <div>
        <label className="text-xs text-muted mb-1.5 block">Asset</label>
        <select
          value={asset}
          onChange={e => setAsset(e.target.value)}
          className="w-full bg-surface border border-border text-white text-sm rounded px-3 py-2 focus:outline-none focus:border-accent"
        >
          {ASSETS.map(a => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        {currentPrice && (
          <p className="text-xs text-muted mt-1">
            Current price: <span className="text-white font-mono">{fmtPrice(currentPrice)}</span>
          </p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="text-xs text-muted mb-1.5 block">Amount (USD)</label>
        <input
          type="number"
          min={1}
          max={balance}
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          className="w-full bg-surface border border-border text-white text-sm font-mono rounded px-3 py-2 focus:outline-none focus:border-accent"
        />
        <div className="flex gap-2 mt-2">
          {QUICK_AMOUNTS.map(q => (
            <button
              key={q}
              onClick={() => setAmount(q)}
              className="flex-1 text-xs bg-surface border border-border text-muted hover:text-white hover:border-accent rounded py-1 transition-colors"
            >
              ${(q / 1000).toFixed(0)}K
            </button>
          ))}
        </div>
      </div>

      {/* Potential gain preview */}
      {currentPrice && amount > 0 && (
        <div className="bg-surface rounded p-3 text-xs text-muted">
          <div className="flex justify-between">
            <span>Position size</span>
            <span className="text-white font-mono">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span>Units at market</span>
            <span className="text-white font-mono">{(amount / currentPrice).toFixed(6)}</span>
          </div>
        </div>
      )}

      {error && <p className="text-bear text-xs">{error}</p>}

      {/* Long / Short buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={() => place('long')}
          disabled={submitting}
          className="flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm bg-bull/10 border border-bull text-bull hover:bg-bull hover:text-white transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          LONG ↑
        </button>
        <button
          onClick={() => place('short')}
          disabled={submitting}
          className="flex items-center justify-center gap-2 py-3 rounded-lg font-bold text-sm bg-bear/10 border border-bear text-bear hover:bg-bear hover:text-white transition-all disabled:opacity-50"
        >
          {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
          SHORT ↓
        </button>
      </div>
    </div>
  )
}
