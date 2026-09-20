import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#faf6f0",
          100: "#f6f1ea",
          200: "#efe7dc",
          300: "#e6dccd",
          400: "#d9ccb8",
        },
        ink: {
          DEFAULT: "#2f2a3d",
          soft: "#5b5468",
          faint: "#8a8175",
        },
        clay: {
          plum: "#7c6a9c",
          "plum-deep": "#5f4f80",
        },
        risk: {
          high: "#e07856",
          "high-soft": "#f0b7a3",
          med: "#e0a458",
          low: "#5b8a72",
          "low-soft": "#a8c7b4",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        clay: "1.75rem",
        "clay-lg": "2.25rem",
      },
      boxShadow: {
        clay: "10px 10px 24px rgba(178,162,138,0.5), -8px -8px 22px rgba(255,255,255,0.85)",
        "clay-sm": "6px 6px 14px rgba(178,162,138,0.45), -5px -5px 12px rgba(255,255,255,0.8)",
        "clay-inset":
          "inset 5px 5px 12px rgba(178,162,138,0.55), inset -5px -5px 12px rgba(255,255,255,0.85)",
        "clay-pressed":
          "inset 3px 3px 8px rgba(178,162,138,0.5), inset -3px -3px 8px rgba(255,255,255,0.7)",
        "clay-plum":
          "8px 8px 20px rgba(95,79,128,0.35), -6px -6px 16px rgba(255,255,255,0.55)",
        glow: "0 0 0 rgba(224,120,86,0)",
      },
      keyframes: {
        "float-in": {
          "0%": { opacity: "0", transform: "translateY(14px) scale(0.98)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "float-in": "float-in 0.5s cubic-bezier(0.22,1,0.36,1) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
