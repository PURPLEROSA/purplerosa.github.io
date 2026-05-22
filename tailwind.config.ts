import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // base surfaces (dark mode mission-control)
        base: "#08080d",
        surface: "#101019",
        "surface-2": "#16161f",
        "surface-3": "#1d1d2b",
        line: "rgba(255,255,255,0.07)",
        "line-strong": "rgba(255,255,255,0.13)",
        // brand accents
        purple: "#a855f7",
        "purple-soft": "#c084fc",
        pink: "#ec4899",
        orange: "#fb923c",
        electric: "#22d3ee",
        lime: "#a3e635",
        // text
        ink: "#f4f3ff",
        "ink-soft": "#b9b8cc",
        "ink-mute": "#7c7b91",
      },
      fontFamily: {
        sans: ["var(--font-assistant)", "system-ui", "sans-serif"],
        display: ["var(--font-rubik)", "var(--font-assistant)", "sans-serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.35rem",
        "3xl": "1.75rem",
      },
      backgroundImage: {
        "brand-gradient":
          "linear-gradient(135deg,#a855f7 0%,#ec4899 50%,#fb923c 100%)",
        "electric-gradient":
          "linear-gradient(135deg,#22d3ee 0%,#a855f7 100%)",
        "glow-radial":
          "radial-gradient(600px circle at 50% 0%,rgba(168,85,247,0.22),transparent 70%)",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(168,85,247,0.25),0 14px 48px -12px rgba(168,85,247,0.4)",
        card: "0 18px 50px -24px rgba(0,0,0,0.85)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        pulseDot: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.4s ease-out both",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-dot": "pulseDot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
