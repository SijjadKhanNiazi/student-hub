/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // enable class-based dark mode
  content: [
    './src/**/*.{js,jsx,ts,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        // Light mode palette
        'brand-bg-light': '#FCFBF7',
        'brand-struct-light': '#2C4A3E',
        'brand-accent-light': '#FF6B35',
        // Dark mode palette
        'brand-bg-dark': '#14121F',
        'brand-struct-dark': '#231E3D',
        'brand-accent-dark': '#FF79C6',
      },
    },
  },
  plugins: [],
};
