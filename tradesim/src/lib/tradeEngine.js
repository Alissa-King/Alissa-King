// P&L for an open trade given its current market price
export function calcPnL(trade, currentPrice) {
  const direction = trade.direction === 'long' ? 1 : -1
  const pricePct = (currentPrice - trade.entry_price) / trade.entry_price
  return direction * pricePct * trade.amount
}

export function calcPnLPercent(trade, currentPrice) {
  const direction = trade.direction === 'long' ? 1 : -1
  const pricePct = (currentPrice - trade.entry_price) / trade.entry_price
  return direction * pricePct * 100
}

// Total portfolio equity = cash balance + unrealised P&L on open trades
export function calcPortfolioValue(balance, openTrades, prices) {
  return openTrades.reduce((total, trade) => {
    const px = prices[trade.asset]?.price
    return px ? total + calcPnL(trade, px) : total
  }, balance)
}

// Momentum signal from a price series.
// Returns 'long', 'short', or null (no clear signal / not enough data)
export function getMomentumSignal(prices, window = 20) {
  if (prices.length < window) return null
  const slice = prices.slice(-window)
  const ma = slice.reduce((a, b) => a + b, 0) / window
  const current = prices.at(-1)
  const threshold = 0.001 // 0.1% band to avoid noise
  if (current > ma * (1 + threshold)) return 'long'
  if (current < ma * (1 - threshold)) return 'short'
  return null
}

export function fmtCurrency(n) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function fmtPrice(n) {
  if (n >= 1000) return fmtCurrency(n)
  return `$${n.toFixed(2)}`
}
