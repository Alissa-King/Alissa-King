'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePortfolio(userId) {
  const [portfolio, setPortfolio] = useState(null)
  const [openTrades, setOpenTrades] = useState([])
  const [closedTrades, setClosedTrades] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  async function loadData() {
    if (!userId) return
    const [{ data: port }, { data: open_ }, { data: closed_ }] = await Promise.all([
      supabase.from('portfolios').select('*').eq('user_id', userId).single(),
      supabase.from('trades').select('*').eq('user_id', userId).eq('status', 'open').order('created_at', { ascending: false }),
      supabase.from('trades').select('*').eq('user_id', userId).eq('status', 'closed').order('closed_at', { ascending: false }).limit(20),
    ])
    setPortfolio(port)
    setOpenTrades(open_ ?? [])
    setClosedTrades(closed_ ?? [])
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    loadData()

    const channel = supabase
      .channel(`portfolio:${userId}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'portfolios',
        filter: `user_id=eq.${userId}`,
      }, payload => setPortfolio(payload.new))
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'trades',
        filter: `user_id=eq.${userId}`,
      }, loadData)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  return { portfolio, openTrades, closedTrades, loading, refresh: loadData }
}
