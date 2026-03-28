import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          DEFAULT: "#0891b2",
          dark: "#0e7490",
          deep: "#155e75",
        },
        ink: {
          DEFAULT: "#0f172a",
          muted: "#64748b",
          subtle: "#94a3b8",
        },
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06), 0 4px 24px rgba(15, 23, 42, 0.04)",
        "card-hover": "0 4px 12px rgba(15, 23, 42, 0.08), 0 12px 40px rgba(15, 23, 42, 0.06)",
        nav: "4px 0 24px rgba(15, 23, 42, 0.08)",
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.25rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "sheet-in": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.35s ease-out forwards",
        "slide-up": "slide-up 0.4s ease-out forwards",
        "sheet-in": "sheet-in 0.28s cubic-bezier(0.32, 0.72, 0, 1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
