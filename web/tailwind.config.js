/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#22c55e', // primary
          hover: '#16a34a',
          soft: '#e7f6ed',
          dark: '#15803d',
        },
        surface: {
          DEFAULT: '#ffffff',
          muted: '#f5f7fb',
        },
        text: {
          main: '#111827',
          muted: '#6b7280',
        },
      },
      boxShadow: {
        soft: '0 4px 18px rgba(15, 23, 42, 0.06)', // soft dashboard shadow
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
};
