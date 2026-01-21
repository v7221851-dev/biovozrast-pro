/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B46EE',
        'primary-dark': '#2B36CC',
        'primary-light': '#5B66F0',
      },
      maxWidth: {
        'container': '1200px',
      },
    },
  },
  plugins: [],
}
