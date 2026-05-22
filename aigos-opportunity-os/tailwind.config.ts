import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0a0a12",
          soft: "#11111d",
          card: "#15151f",
          raised: "#1c1c2a",
          border: "#2a2a3c",
        },
        brand: {
          pink: "#ec4899",
          purple: "#a855f7",
          orange: "#fb923c",
        },
        accent: {
          amber: "#f59e0b",
          red: "#ef4444",
          green: "#34d399",
          blue: "#60a5fa",
        },
      },
      fontFamily: {
        sans: [
          "Assistant",
          "Heebo",
          "Rubik",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
      boxShadow: {
        glow: "0 0 40px -12px rgba(168, 85, 247, 0.45)",
        card: "0 8px 30px -12px rgba(0, 0, 0, 0.7)",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #fb923c 100%)",
        "brand-soft":
          "linear-gradient(135deg, rgba(236,72,153,0.15) 0%, rgba(168,85,247,0.15) 50%, rgba(251,146,60,0.15) 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out both",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
