import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-lexend)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eff7ff',
          100: '#dbeefe',
          200: '#bfe1fe',
          300: '#93cdfd',
          400: '#60b1fa',
          500: '#3b92f6',
          600: '#2574eb',
          700: '#1d5ed8',
          800: '#1e4caf',
          900: '#1e428a',
        },
        leaf: {
          50: '#effcf4',
          100: '#d8f7e3',
          500: '#22b866',
          600: '#169552',
          700: '#157644',
        },
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)',
      },
      keyframes: {
        pop: { '0%': { transform: 'scale(0.96)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        rise: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
      animation: {
        pop: 'pop 180ms ease-out',
        rise: 'rise 240ms ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
