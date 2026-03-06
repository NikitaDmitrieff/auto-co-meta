import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        fg: '#e0e0e0',
        border: '#ffffff',
        surface: '#1a1a1a',
        'surface-hover': '#2a2a2a',
        'accent-green': '#00FF41',
        'accent-pink': '#FF0080',
        'accent-blue': '#00D4FF',
        'accent-yellow': '#FFE000',
        'accent-red': '#FF3333',
        'accent-grow': '#00FF88',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
      },
      borderRadius: {
        'none': '0px',
      },
      animation: {
        'blink': 'blink 1s infinite',
        'cursor-blink': 'blink 0.7s infinite',
        'pulse-slow': 'pulse 3s infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
