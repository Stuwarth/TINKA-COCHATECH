/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'fie-magenta': '#C40079', 
        'fie-blue': '#002C6A', 
      }
    },
  },
  plugins: [],
}
