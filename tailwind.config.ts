import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: "var(--color-bg)",
          card: "var(--color-card)",
          "card-hover": "var(--color-card-hover)",
          border: "var(--color-border)",
          text: "var(--color-text)",
          muted: "var(--color-muted)",
          accent: "var(--color-accent)",
          red: "var(--color-red)",
          green: "var(--color-green)",
          gold: "var(--color-gold)",
        },
      },
    },
  },
  plugins: [],
};

export default config;
