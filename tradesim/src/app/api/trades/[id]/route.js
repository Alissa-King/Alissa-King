import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllPrices } from '@/lib/prices'
import { calcPnL } from '@/lib/tradeEngine'

export const dynamic = 'force-dynamic'

export async function DELETE(request, { params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify trade belongs to user
  const { data: trade, error: fetchErr } = await supabase
    .from('trades')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .eq('status', 'open')
    .single()

  if (fetchErr || !trade) {
    return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
  }

  // Get exit price
  const prices = await getAllPrices()
  const currentPrice = prices[trade.asset]?.price
  if (!currentPrice) {
    return NextResponse.json({ error: 'Price feed unavailable — try again' }, { status: 503 })
  }

  const pnl = calcPnL(trade, currentPrice)

  // Close trade
  await supabase
    .from('trades')
    .update({
      status: 'closed',
      exit_price: currentPrice,
      pnl,
      closed_at: new Date().toISOString(),
    })
    .eq('id', trade.id)

  // Return margin + P&L to balance
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  await supabase
    .from('portfolios')
    .update({
      balance: (portfolio?.balance ?? 0) + trade.amount + pnl,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  return NextResponse.json({ pnl, exit_price: currentPrice })
}
