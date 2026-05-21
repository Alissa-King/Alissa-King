import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getAllPrices } from '@/lib/prices'
import { getMomentumSignal, calcPnL } from '@/lib/tradeEngine'

export const dynamic = 'force-dynamic'

const BOT_ASSET = 'BTC/USD'
const BOT_POSITION_PCT = 0.5 // bot allocates 50% of cash per trade

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

export async function POST() {
  const botUserId = process.env.BOT_USER_ID
  if (!botUserId) {
    return NextResponse.json({ error: 'BOT_USER_ID not configured' }, { status: 500 })
  }

  const supabase = serviceClient()
  const prices = await getAllPrices()
  const currentPrice = prices[BOT_ASSET]?.price
  if (!currentPrice) {
    return NextResponse.json({ error: 'No price data for BTC/USD' }, { status: 503 })
  }

  // Record price history for MA calculation
  await supabase.from('price_history').insert({ asset: BOT_ASSET, price: currentPrice })

  // Fetch last 25 candles (trimmed to 20 in signal fn)
  const { data: history } = await supabase
    .from('price_history')
    .select('price')
    .eq('asset', BOT_ASSET)
    .order('recorded_at', { ascending: false })
    .limit(25)

  const priceList = (history ?? []).map(r => r.price).reverse()
  const signal = getMomentumSignal(priceList)

  // Load bot portfolio
  const { data: portfolio } = await supabase
    .from('portfolios')
    .select('*')
    .eq('user_id', botUserId)
    .single()

  if (!portfolio) {
    return NextResponse.json({ signal, price: currentPrice, action: 'no-portfolio' })
  }

  // Load bot's open trades on BTC/USD
  const { data: openTrades } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', botUserId)
    .eq('asset', BOT_ASSET)
    .eq('status', 'open')

  let action = 'hold'
  let balance = portfolio.balance

  // Close any trades that conflict with the new signal (or if no signal, hold)
  for (const trade of openTrades ?? []) {
    const shouldClose = signal && trade.direction !== signal
    if (shouldClose) {
      const pnl = calcPnL(trade, currentPrice)
      await supabase.from('trades').update({
        status: 'closed',
        exit_price: currentPrice,
        pnl,
        closed_at: new Date().toISOString(),
      }).eq('id', trade.id)
      balance += trade.amount + pnl
      action = 'closed'
    }
  }

  // Open new position if signal exists and no matching position
  const hasMatchingPosition = (openTrades ?? []).some(t => t.direction === signal)
  if (signal && !hasMatchingPosition && balance >= 500) {
    const tradeAmount = Math.floor(balance * BOT_POSITION_PCT)
    await supabase.from('trades').insert({
      user_id: botUserId,
      asset: BOT_ASSET,
      direction: signal,
      amount: tradeAmount,
      entry_price: currentPrice,
    })
    await supabase.from('portfolios').update({
      balance: balance - tradeAmount,
      updated_at: new Date().toISOString(),
    }).eq('user_id', botUserId)
    action = `${signal}-opened`
  } else if (action === 'hold') {
    // Update balance if we closed trades
    await supabase.from('portfolios').update({
      balance,
      updated_at: new Date().toISOString(),
    }).eq('user_id', botUserId)
  }

  return NextResponse.json({
    signal,
    price: currentPrice,
    action,
    priceCount: priceList.length,
  })
}
