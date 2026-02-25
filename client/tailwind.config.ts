import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'score-low': '#1e3a5f',
        'score-teal': '#0d7377',
        'score-amber': '#f4a500',
        'score-orange': '#e85d04',
        'score-high': '#9b0000',
      },
      animation: {
        'pulse-ring': 'pulse-ring 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;
