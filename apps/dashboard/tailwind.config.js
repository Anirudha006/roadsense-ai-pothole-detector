/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        roadsense: {
          bg: '#F4FBFA',
          surface: '#FFFFFF',
          primary: '#14B8A6',
          'primary-soft': '#CCFBF1',
          accent: '#6366F1',
          sun: '#FBBF24',
          coral: '#FB7185',
          success: '#34D399',
          text: '#0F2A2E',
          muted: '#5B7479',
          border: '#D8EEEA',
        },
      },
      boxShadow: {
        card: '0 8px 30px rgba(20, 184, 166, 0.12)',
        'card-hover': '0 12px 36px rgba(20, 184, 166, 0.18)',
        alert: '0 10px 40px rgba(251, 113, 133, 0.25)',
        floating: '0 6px 20px rgba(15, 42, 46, 0.10)',
      },
      borderRadius: {
        sm: '12px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        full: '9999px',
      },
      fontFamily: {
        heading: ["'Plus Jakarta Sans'", "'Poppins'", 'sans-serif'],
        body: ["'Inter'", 'sans-serif'],
      },
    },
  },
  plugins: [],
};
