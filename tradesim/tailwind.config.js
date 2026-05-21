/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
    './src/app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#0d1117',
        panel: '#161b22',
        border: '#21262d',
        muted: '#8b949e',
        accent: '#58a6ff',
        bull: '#3fb950',
        bear: '#f85149',
      },
      animation: {
        'flash-up': 'flashGreen 0.6s ease-out',
        'flash-down': 'flashRed 0.6s ease-out',
        'ticker': 'ticker 30s linear infinite',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(63,185,80,0.35)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(248,81,73,0.35)' },
          '100%': { backgroundColor: 'transparent' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
