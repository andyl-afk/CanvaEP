import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Canva Sans", "system-ui", "sans-serif"],
        display: ["Canva Sans Display", "system-ui", "sans-serif"],
      },
      colors: {
        // Core brand gradient stops
        canva: {
          teal: "#00C4CC",
          blue: "#5A32FA",
          purple: "#7D2AE8",
        },
        // Secondary palette
        brand: {
          turquoise: "#00C4CC",
          blue: "#4D8EF7",
          purple: "#9B59B6",
          green: "#00B870",
          orange: "#FF7A2F",
          red: "#F05252",
          pink: "#E040A0",
        },
        // Surfaces
        surface: {
          DEFAULT: "rgba(255,255,255,0.04)",
          hover: "rgba(255,255,255,0.07)",
          active: "rgba(255,255,255,0.10)",
        },
        // Borders
        border: {
          DEFAULT: "rgba(255,255,255,0.08)",
          strong: "rgba(255,255,255,0.14)",
        },
      },
      backgroundImage: {
        "canva-gradient": "linear-gradient(135deg, #00c4cc, #5a32fa, #7d2ae8)",
        "canva-gradient-h": "linear-gradient(90deg, #00c4cc, #5a32fa, #7d2ae8)",
        "page-bg":
          "linear-gradient(160deg, #0a0a14 0%, #12082a 30%, #1a0e3a 50%, #0d1a2e 70%, #0a0a14 100%)",
      },
      borderRadius: {
        panel: "20px",
      },
      letterSpacing: {
        heading: "-0.03em",
      },
      backdropBlur: {
        glass: "12px",
        "glass-lg": "24px",
      },
    },
  },
  plugins: [],
};

export default config;
