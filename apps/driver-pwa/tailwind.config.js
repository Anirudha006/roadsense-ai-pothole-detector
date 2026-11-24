/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: '#F4FBFA',
        card: '#FFFFFF',
        text: '#0F172A',
        muted: '#64748B',
        teal: {
          50: '#F0FDFA',
          100: '#CCFBF1',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
        },
        mint: {
          50: '#ECFDF5',
          400: '#34D399',
          500: '#10B981',
        },
        sun: {
          50: '#FFFBEB',
          400: '#FBBF24',
          500: '#F59E0B',
          600: '#D97706',
        },
        coral: {
          50: '#FFF1F2',
          400: '#FB7185',
          500: '#F43F5E',
          600: '#E11D48',
        },
        border: '#D8EEEA',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(20,184,166,0.12)',
        alert: '0 12px 36px rgba(251,113,133,0.25)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
