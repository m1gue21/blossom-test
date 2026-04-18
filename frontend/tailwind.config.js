/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          100: '#EEE3FF',
          600: '#8054C7',
          700: '#5A3696',
        },
        heart: '#63D838',
        'heart-empty': '#d1d5db',
        page:   '#F7F7FA',
        surface: '#f9fafb',
        border: '#e5e7eb',
        'text-primary':   '#111827',
        'text-secondary': '#6b7280',
        'text-label':     '#9ca3af',
        'filter-badge':      '#EEE3FF',
        'filter-badge-text': '#8054C7',
      },
      fontFamily: {
        sans: ['Greycliff CF', 'DM Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-in-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'slide-up':   'slideUp 0.3s cubic-bezier(0.32,0.72,0,1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
