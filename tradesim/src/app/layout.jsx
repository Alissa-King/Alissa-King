import './globals.css'

export const metadata = {
  title: 'TradeSim — Paper Trading Competition',
  description: 'Compete with real-time BTC & stock prices. Start with $100K virtual cash. Best % return wins.',
  openGraph: {
    title: 'TradeSim',
    description: 'Paper trading competition with live prices, AI bots & leaderboards',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
