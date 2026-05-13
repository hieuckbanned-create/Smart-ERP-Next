/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3b82f6', 50: '#eff6ff', 100: '#dbeafe' },
      },
    },
  },
  plugins: [],
};