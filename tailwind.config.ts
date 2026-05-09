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
        mystic: {
          dark: '#0A0A1A',
          purple: '#6B21A8',
          gold: '#F59E0B',
          pink: '#EC4899',
          light: '#E2E8F0',
          card: '#1E1B4B',
          glow: '#8B5CF6',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 32px rgba(139, 92, 246, 0.35)',
        gold: '0 0 28px rgba(245, 158, 11, 0.28)',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.6)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sweep: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        float: 'float 7s ease-in-out infinite',
        sweep: 'sweep 8s linear infinite',
      },
    },
  },
  plugins: [],
}
export default config
