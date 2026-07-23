/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: "#1C1A16",
        paper: "#EFE9DA",
        paperCard: "#F7F3E8",
        rust: "#9C3B2E",
        brass: "#A6813E",
        ledger: "#3C4A3A",
      },
      fontFamily: {
        display: ["'Libre Caslon Text'", "serif"],
        body: ["'Source Serif 4'", "serif"],
        monoSpec: ["'Courier Prime'", "monospace"],
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
}
