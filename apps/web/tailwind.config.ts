import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        obsidian:  '#0D0C0A',
        cave:      '#1A1814',
        stone:     '#2C2820',
        pit:       '#232017',
        dust:      '#6B6355',
        linen:     '#E8E0D0',
        gold:      '#C4A064',
        'gold-dim':'#3D2E1C',
        jungle:    '#2E4A3E',
        cenote:    '#5DCAA5',
      },
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans:  ['Inter', 'DM Sans', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
    },
  },
  plugins: [],
}

export default config
