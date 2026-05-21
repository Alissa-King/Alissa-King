'use client'
import { useMemo } from 'react'
import { calcPortfolioValue, fmtCurrency } from '@/lib/tradeEngine'
import { TrendingUp, TrendingDown, Activity, Award } from 'lucide-react'

const START_BALANCE = 100_000

export default function PortfolioStats({ portfolio, openTrades, closedTrades, prices }) {
  const balance = portfolio?.balance ?? START_BALANCE

  const equity = useMemo(
    () => calcPortfolioValue(balance, openTrades, prices),
    [balance, openTrades, prices]
  )

  const totalReturn = equity - START_BALANCE
  const pctReturn = (totalReturn / START_BALANCE) * 100
  const isPositive = totalReturn >= 0

  const wins = closedTrades.filter(t => t.pnl > 0).length
  const winRate = closedTrades.length ? Math.round((wins / closedTrades.length) * 100) : 0

  const stats = [
    {
      label: 'Portfolio Value',
      value: fmtCurrency(equity),
      sub: `Cash: ${fmtCurrency(balance)}`,
      icon: <Activity size={16} />,
      color: 'text-accent',
    },
    {
      label: 'Total Return',
      value: `${isPositive ? '+' : ''}${fmtCurrency(totalReturn)}`,
      sub: `${isPositive ? '+' : ''}${pctReturn.toFixed(2)}%`,
      icon: isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />,
      color: isPositive ? 'text-bull' : 'text-bear',
    },
    {
      label: 'Win Rate',
      value: `${winRate}%`,
      sub: `${wins}/${closedTrades.length} trades`,
      icon: <Award size={16} />,
      color: 'text-yellow-400',
    },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-panel border border-border rounded-lg p-4">
          <div className={`flex items-center gap-1.5 mb-2 ${s.color}`}>
            {s.icon}
            <span className="text-xs text-muted uppercase tracking-wide">{s.label}</span>
          </div>
          <p className={`text-xl font-bold font-mono ${s.color}`}>{s.value}</p>
          <p className="text-xs text-muted mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
  )
}
