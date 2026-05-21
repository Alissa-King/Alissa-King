'use client'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { fmtCurrency } from '@/lib/tradeEngine'
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react'

const MEDALS = ['🥇', '🥈', '🥉']

export default function Leaderboard({ currentUserId, compact = false }) {
  const entries = useLeaderboard(compact ? 10 : 50)

  return (
    <div className="bg-panel border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Trophy size={14} className="text-yellow-400" />
        <h3 className="text-sm font-semibold text-white">Leaderboard</h3>
        <span className="text-xs text-muted ml-auto">Live</span>
        <span className="w-2 h-2 rounded-full bg-bull animate-pulse" />
      </div>

      <div className="divide-y divide-border">
        {entries.length === 0 && (
          <p className="text-center text-muted text-sm py-8">No traders yet. Be the first!</p>
        )}
        {entries.map((e, i) => {
          const isPositive = e.pct_return >= 0
          const isMe = e.user_id === currentUserId

          return (
            <div
              key={e.user_id}
              className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                isMe ? 'bg-accent/5 border-l-2 border-accent' : 'hover:bg-surface/60'
              }`}
            >
              {/* Rank */}
              <span className="w-6 text-sm font-bold text-center">
                {i < 3 ? MEDALS[i] : <span className="text-muted">{i + 1}</span>}
              </span>

              {/* Username */}
              <span className="flex-1 text-sm font-medium text-white truncate">
                {e.username}
                {isMe && <span className="ml-1.5 text-xs text-accent">(you)</span>}
              </span>

              {/* Trades */}
              {!compact && (
                <span className="text-xs text-muted hidden sm:block">{e.total_trades} trades</span>
              )}

              {/* Balance */}
              <span className="text-xs font-mono text-muted hidden md:block">
                {fmtCurrency(e.balance)}
              </span>

              {/* % Return */}
              <span
                className={`text-sm font-bold font-mono flex items-center gap-0.5 ${
                  isPositive ? 'text-bull' : 'text-bear'
                }`}
              >
                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isPositive ? '+' : ''}{e.pct_return}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
