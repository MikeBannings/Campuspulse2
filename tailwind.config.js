/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Plus Jakarta Sans', 'ui-sans-serif', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#f1f0ff',
          100: '#e5e3ff',
          200: '#cdcaff',
          300: '#aaa3ff',
          400: '#8a7dff',
          500: '#6d5cf6',
          600: '#5b43ea',
          700: '#4c34cf',
          800: '#3f2ca8',
          900: '#352a84',
        },
        pulse: {
          400: '#ff7ab6',
          500: '#ff4d9d',
          600: '#ec2f86',
        },
      },
      boxShadow: {
        glass: '0 8px 32px rgba(76, 52, 207, 0.12)',
        glow: '0 0 0 4px rgba(109, 92, 246, 0.18)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pop-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pulse-ring': {
          '0%': { boxShadow: '0 0 0 0 rgba(255,77,157,0.55)' },
          '100%': { boxShadow: '0 0 0 10px rgba(255,77,157,0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.45s ease-out both',
        'pop-in': 'pop-in 0.2s ease-out both',
        'pulse-ring': 'pulse-ring 1.6s ease-out infinite',
        float: 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
