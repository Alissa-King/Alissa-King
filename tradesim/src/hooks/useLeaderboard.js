'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLeaderboard(limit = 20) {
  const [entries, setEntries] = useState([])
  const supabase = createClient()

  async function load() {
    const { data } = await supabase
      .from('leaderboard')
      .select('*')
      .limit(limit)
    setEntries(data ?? [])
  }

  useEffect(() => {
    load()

    // Recompute when any portfolio balance changes
    const channel = supabase
      .channel('leaderboard:global')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'portfolios' }, load)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return entries
}
