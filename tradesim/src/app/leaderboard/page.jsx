'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Leaderboard from '@/components/Leaderboard'
import { TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function LeaderboardPage() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) router.replace('/')
      else setUser(user)
    })
  }, [])

  return (
    <div className="min-h-screen bg-surface">
      <header className="border-b border-border bg-panel px-6 py-4 flex items-center gap-4">
        <TrendingUp size={18} className="text-accent" />
        <span className="font-bold text-white">TradeSim</span>
        <Link href="/dashboard" className="ml-auto flex items-center gap-1.5 text-xs text-muted hover:text-white transition-colors">
          <ArrowLeft size={13} />
          Back to trading
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-white mb-6">Global Leaderboard</h1>
        <Leaderboard currentUserId={user?.id} compact={false} />
      </main>
    </div>
  )
}
