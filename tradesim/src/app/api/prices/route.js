import { NextResponse } from 'next/server'
import { getAllPrices } from '@/lib/prices'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const prices = await getAllPrices()
    return NextResponse.json(prices, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 502 })
  }
}
