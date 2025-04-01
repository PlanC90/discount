/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class', // Enable dark mode
  theme: {
    extend: {
      colors: {
        'dark-primary': '#1A202C',
        'dark-secondary': '#2D3748',
        'dark-text': '#FFFFFF',
        'light-text': '#2D3748',
      },
    },
  },
  plugins: [],
};
