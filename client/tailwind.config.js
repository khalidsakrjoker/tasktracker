/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        theme: {
          page: "var(--bg-page)",
          card: "var(--bg-card)",
          elevated: "var(--bg-elevated)",
          subtle: "var(--bg-subtle)",
          input: "var(--bg-input)",
          hover: "var(--bg-hover)",
          border: "var(--border-main)",
          borderSubtle: "var(--border-subtle)",
          text: "var(--text-main)",
          textSecondary: "var(--text-secondary)",
          textMuted: "var(--text-muted)"
        },
        obsidian: {
          950: "#0B0F19",
          900: "#111827",
          850: "#182234",
          800: "#1E293B",
          750: "#243247",
          700: "#334155",
          600: "#475569"
        },
        cyber: {
          blue: "#2563EB",
          emerald: "#10B981",
          purple: "#8B5CF6",
          amber: "#F59E0B",
          rose: "#EF4444"
        }
      },
      fontFamily: {
        sans: ['"Alexandria"', "system-ui", "-apple-system", "sans-serif"]
      }
    }
  },
  plugins: []
};
