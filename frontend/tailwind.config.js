/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          DEFAULT: '#800020',
          dark: '#600018',
        },
        beige: '#F5F5DC',
      },
      maxWidth: {
        '2xl': '42rem',
      },
      maxHeight: {
        '80vh': '80vh',
      },
    },
  },
  plugins: [],
};