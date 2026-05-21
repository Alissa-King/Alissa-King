import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getAllPrices } from '@/lib/prices'

export const dynamic = 'force-dynamic'

export async function POST(request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { asset, direction, amount } = body
  if (!asset || !direction || !amount) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }
  if (!['long', 'short'].includes(direction)) {
    return NextResponse.json({ error: 'direction must be long or short' }, { status: 400 })
  }
  if (amount <= 0) {
    return NextResponse.json({ error: 'amount must be positive' }, { status: 400 })
  }

  // Get current market price
  const prices = await getAllPrices()
  const priceData = prices[asset]
  if (!priceData) {
    return NextResponse.json({ error: `Unknown asset: ${asset}` }, { status: 400 })
  }

  // Check portfolio balance
  const { data: portfolio, error: portErr } = await supabase
    .from('portfolios')
    .select('balance')
    .eq('user_id', user.id)
    .single()

  if (portErr || !portfolio) {
    return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
  }
  if (portfolio.balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 422 })
  }

  // Place trade
  const { data: trade, error: tradeErr } = await supabase
    .from('trades')
    .insert({
      user_id: user.id,
      asset,
      direction,
      amount,
      entry_price: priceData.price,
    })
    .select()
    .single()

  if (tradeErr) {
    return NextResponse.json({ error: tradeErr.message }, { status: 500 })
  }

  // Deduct from balance
  const { error: balErr } = await supabase
    .from('portfolios')
    .update({ balance: portfolio.balance - amount, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (balErr) {
    // Roll back trade
    await supabase.from('trades').delete().eq('id', trade.id)
    return NextResponse.json({ error: balErr.message }, { status: 500 })
  }

  return NextResponse.json(trade, { status: 201 })
}
