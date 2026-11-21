/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        obsidian: {
          950: "#070A0F",
          900: "#0B0F17",
          850: "#101726",
          800: "#131B2A",
          750: "#182236",
          700: "#1E293B",
          600: "#334155"
        },
        cyber: {
          blue: "#38BDF8",
          emerald: "#10B981",
          purple: "#A855F7",
          amber: "#F59E0B",
          rose: "#F43F5E"
        }
      },
      fontFamily: {
        sans: ['"Alexandria"', "system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  plugins: []
};
