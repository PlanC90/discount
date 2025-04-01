/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1A202C',
        'dark-secondary': '#2D3748',
        'dark-tertiary': '#4A5568',
        'dark-text': '#FFFFFF',
        'brand-yellow': '#D69E2E',
        'brand-blue': '#3182CE',
      },
      fontFamily: {
        'sans': ['Roboto', 'sans-serif'],
      },
      spacing: {
        '2px': '2px',
        '5px': '5px', // Added 5px spacing
      }
    },
  },
  plugins: [],
}
