'use client'
import { useEffect, useRef } from 'react'

const SYMBOL_MAP = {
  'BTC/USD': 'BINANCE:BTCUSDT',
  'ETH/USD': 'BINANCE:ETHUSDT',
  AAPL: 'NASDAQ:AAPL',
  TSLA: 'NASDAQ:TSLA',
  NVDA: 'NASDAQ:NVDA',
}

const CONTAINER_ID = 'tv_chart_main'

export default function Chart({ asset = 'BTC/USD' }) {
  const scriptRef = useRef(null)

  useEffect(() => {
    const symbol = SYMBOL_MAP[asset] ?? 'BINANCE:BTCUSDT'

    function mountWidget() {
      const container = document.getElementById(CONTAINER_ID)
      if (!container || !window.TradingView) return
      container.innerHTML = ''
      new window.TradingView.widget({
        container_id: CONTAINER_ID,
        autosize: true,
        symbol,
        interval: '15',
        timezone: 'Etc/UTC',
        theme: 'dark',
        style: '1',
        locale: 'en',
        toolbar_bg: '#161b22',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        save_image: false,
        backgroundColor: '#0d1117',
        gridColor: 'rgba(33,38,45,0.9)',
      })
    }

    if (window.TradingView) {
      mountWidget()
      return
    }

    if (!scriptRef.current) {
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.async = true
      s.onload = mountWidget
      document.head.appendChild(s)
      scriptRef.current = s
    } else {
      scriptRef.current.addEventListener('load', mountWidget)
    }

    return () => {
      const container = document.getElementById(CONTAINER_ID)
      if (container) container.innerHTML = ''
    }
  }, [asset])

  return (
    <div className="rounded-lg overflow-hidden border border-border bg-panel" style={{ height: 460 }}>
      <div id={CONTAINER_ID} className="w-full h-full" />
    </div>
  )
}
