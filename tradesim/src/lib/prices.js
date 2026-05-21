const COINGECKO = 'https://api.coingecko.com/api/v3'
const ALPACA_DATA = 'https://data.alpaca.markets/v2'

export async function getCryptoPrices() {
  const res = await fetch(
    `${COINGECKO}/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error('CoinGecko fetch failed')
  const raw = await res.json()

  return {
    'BTC/USD': {
      price: raw.bitcoin?.usd ?? 0,
      change24h: raw.bitcoin?.usd_24h_change ?? 0,
    },
    'ETH/USD': {
      price: raw.ethereum?.usd ?? 0,
      change24h: raw.ethereum?.usd_24h_change ?? 0,
    },
  }
}

export async function getStockPrices() {
  const key = process.env.ALPACA_API_KEY
  const secret = process.env.ALPACA_SECRET_KEY
  if (!key || !secret) return {}

  const res = await fetch(
    `${ALPACA_DATA}/stocks/bars/latest?symbols=AAPL,TSLA,NVDA&feed=iex`,
    {
      headers: {
        'APCA-API-KEY-ID': key,
        'APCA-API-SECRET-KEY': secret,
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return {}
  const { bars } = await res.json()

  return Object.fromEntries(
    Object.entries(bars ?? {}).map(([sym, bar]) => [
      sym,
      { price: bar.c, change24h: 0 },
    ])
  )
}

export async function getAllPrices() {
  const [crypto, stocks] = await Promise.allSettled([
    getCryptoPrices(),
    getStockPrices(),
  ])
  return {
    ...(crypto.status === 'fulfilled' ? crypto.value : {}),
    ...(stocks.status === 'fulfilled' ? stocks.value : {}),
  }
}
