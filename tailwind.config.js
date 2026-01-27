/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // Royal Blue
        "background-light": "#f6f6f8",
        "background-dark": "#111621",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "sans": ["Manrope", "sans-serif"], // Set as default sans
      },
    },
  },
  plugins: [],
}
