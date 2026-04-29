import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Poppins', 'sans-serif'],
        ui: ['Space Grotesk', 'sans-serif'],
        code: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        'marquee-left': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(calc(-100% - var(--gap)))' },
        },
        'marquee-right': {
          from: { transform: 'translateX(calc(-100% - var(--gap)))' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'marquee-left': 'marquee-left var(--duration, 30s) linear infinite',
        'marquee-right': 'marquee-right var(--duration, 30s) linear infinite',
      },
      colors: {
        phantom: {
          black: '#0a0a0a',
          lime: '#89F336',
          surface: '#111111',
          'surface-dark': '#0d0d0d',
          border: '#222222',
          'border-subtle': '#1a1a1a',
          'text-primary': '#f0f0f0',
          'text-secondary': '#888888',
          'text-muted': '#444444',
          danger: '#ff4444',
          success: '#89F336',
          neon: '#00FF88',
          warning: '#f5c518',
        },
      },
    },
  },
  plugins: [],
}

export default config
