'use client'
import { useState, useEffect, useRef } from 'react'
import { getMomentumSignal } from '@/lib/tradeEngine'
import { Bot, Play, Square, Activity } from 'lucide-react'

export default function AIBotPanel({ prices }) {
  const [running, setRunning] = useState(false)
  const [lastSignal, setLastSignal] = useState(null)
  const [lastAction, setLastAction] = useState(null)
  const [priceBuffer, setPriceBuffer] = useState([])
  const [log, setLog] = useState([])
  const timer = useRef(null)

  // Feed BTC price into the momentum buffer
  useEffect(() => {
    const px = prices['BTC/USD']?.price
    if (!px) return
    setPriceBuffer(buf => {
      const next = [...buf, px].slice(-25)
      return next
    })
  }, [prices])

  // Compute signal whenever buffer updates
  useEffect(() => {
    const signal = getMomentumSignal(priceBuffer)
    setLastSignal(signal)
  }, [priceBuffer])

  async function runBotTick() {
    try {
      const res = await fetch('/api/bot', { method: 'POST' })
      const data = await res.json()
      const msg = data.action === 'long-opened'
        ? `Opened LONG @ $${data.price?.toFixed(0)}`
        : data.action === 'short-opened'
        ? `Opened SHORT @ $${data.price?.toFixed(0)}`
        : data.action === 'closed'
        ? `Closed position @ $${data.price?.toFixed(0)}`
        : data.signal
        ? `Signal: ${data.signal} — holding`
        : 'No signal (price near MA)'

      setLastAction(msg)
      setLog(l => [{ time: new Date().toLocaleTimeString(), msg }, ...l].slice(0, 8))
    } catch {
      setLog(l => [{ time: new Date().toLocaleTimeString(), msg: 'Bot tick failed' }, ...l].slice(0, 8))
    }
  }

  useEffect(() => {
    if (running) {
      runBotTick()
      timer.current = setInterval(runBotTick, 30_000)
    } else {
      clearInterval(timer.current)
    }
    return () => clearInterval(timer.current)
  }, [running])

  const maWindow = 20
  const ma = priceBuffer.length >= maWindow
    ? priceBuffer.slice(-maWindow).reduce((a, b) => a + b, 0) / maWindow
    : null
  const currentPx = priceBuffer.at(-1)
  const strength = ma && currentPx
    ? Math.abs(((currentPx - ma) / ma) * 100).toFixed(2)
    : null

  const signalColor = lastSignal === 'long'
    ? 'text-bull border-bull/40 bg-bull/5'
    : lastSignal === 'short'
    ? 'text-bear border-bear/40 bg-bear/5'
    : 'text-muted border-border bg-surface'

  return (
    <div className="bg-panel border border-border rounded-lg p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot size={16} className="text-accent" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wide">AI Bot</h2>
          <span className="text-xs text-muted">20-MA Momentum</span>
        </div>
        <button
          onClick={() => setRunning(r => !r)}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
            running
              ? 'bg-bear/10 border border-bear/40 text-bear hover:bg-bear/20'
              : 'bg-bull/10 border border-bull/40 text-bull hover:bg-bull/20'
          }`}
        >
          {running ? <><Square size={11} /> Stop</> : <><Play size={11} /> Start</>}
        </button>
      </div>

      {/* Signal readout */}
      <div className={`rounded-lg border p-3 ${signalColor}`}>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide font-semibold">
            Current Signal
          </span>
          <Activity size={12} className="opacity-60" />
        </div>
        <p className="text-2xl font-bold font-mono mt-1">
          {lastSignal ? lastSignal.toUpperCase() : 'NEUTRAL'}
        </p>
        <div className="flex gap-4 mt-2 text-xs opacity-70 font-mono">
          <span>MA(20): {ma ? `$${ma.toFixed(0)}` : `${priceBuffer.length}/20 bars`}</span>
          {strength && <span>Strength: {strength}%</span>}
        </div>
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted uppercase tracking-wide">Activity Log</p>
          {log.map((entry, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="text-muted font-mono w-16 shrink-0">{entry.time}</span>
              <span className="text-white">{entry.msg}</span>
            </div>
          ))}
        </div>
      )}

      {!running && log.length === 0 && (
        <p className="text-xs text-muted">
          Start the bot to auto-trade with momentum strategy. It ticks every 30 s.
        </p>
      )}
    </div>
  )
}
