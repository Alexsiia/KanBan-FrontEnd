/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "ui-sans-serif", "system-ui"],
        mono: ["var(--font-geist-mono)", "ui-monospace"],
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        kanban: {
          bg: "#0D0F14",
          surface: "#161922",
          card: "#1E2330",
          border: "#2A3045",
          accent: "#6C63FF",
          "accent-light": "#8A84FF",
          "accent-glow": "rgba(108, 99, 255, 0.15)",
          text: "#E2E8F0",
          muted: "#718096",
          success: "#48BB78",
          warning: "#F6AD55",
          danger: "#FC8181",
          info: "#63B3ED",
        },
      },
      boxShadow: {
        "glow-accent": "0 0 20px rgba(108, 99, 255, 0.3)",
        "glow-sm": "0 0 10px rgba(108, 99, 255, 0.15)",
        card: "0 4px 24px rgba(0,0,0,0.4)",
        modal: "0 25px 80px rgba(0,0,0,0.6)",
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-glow": "pulseGlow 2s ease-in-out infinite",
        shimmer: "shimmer 1.5s infinite",
        "scale-in": "scaleIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: "translateY(16px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        scaleIn: { from: { opacity: 0, transform: "scale(0.95)" }, to: { opacity: 1, transform: "scale(1)" } },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 10px rgba(108,99,255,0.2)" },
          "50%": { boxShadow: "0 0 24px rgba(108,99,255,0.5)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
