'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

export function usePrices(intervalMs = 3000) {
  const [prices, setPrices] = useState({})
  const [prev, setPrev] = useState({})
  const timer = useRef(null)

  const fetch_ = useCallback(async () => {
    try {
      const res = await fetch('/api/prices')
      if (!res.ok) return
      const data = await res.json()
      setPrev(p => ({ ...p, ...prices }))
      setPrices(data)
    } catch {
      // network blip — keep last known prices
    }
  }, [prices])

  useEffect(() => {
    fetch_()
    timer.current = setInterval(fetch_, intervalMs)
    return () => clearInterval(timer.current)
  }, [])  // intentionally run once; fetch_ closes over prices via ref

  // direction: 'up' | 'down' | null
  function direction(asset) {
    const cur = prices[asset]?.price
    const old = prev[asset]?.price
    if (!cur || !old || cur === old) return null
    return cur > old ? 'up' : 'down'
  }

  return { prices, direction }
}
