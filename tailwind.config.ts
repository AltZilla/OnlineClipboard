import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'handwriting': ['Kalam', 'cursive'],
      },
      colors: {
        'notebook': {
          'paper': '#fefefe',
          'paper-warm': '#fffef7',
          'line': '#e0e0e0',
          'margin': '#ff6b6b',
          'text': '#1e3a8a',
          'text-light': '#3b82f6',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
export default config
