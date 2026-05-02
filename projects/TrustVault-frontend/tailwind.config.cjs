/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  daisyui: {
    themes: ['business', 'emerald', 'luxury'],
    logs: false,
  },
  plugins: [require('daisyui')],
}
