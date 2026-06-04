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
        sans: ["var(--font-noto-sans-thai)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        'primary': 'rgb(var(--primary) / <alpha-value>)',
        'secondary': 'rgb(var(--secondary) / <alpha-value>)',
        'background': 'rgb(var(--background) / <alpha-value>)',
        'status': 'rgb(var(--status) / <alpha-value>)',
        'notice': 'rgb(var(--notice) / <alpha-value>)',
        'card': 'rgb(var(--card) / <alpha-value>)',
      },
      backgroundImage: {
        'theme-gradient': 'var(--theme-gradient)',
      }
    },
  },
  plugins: []
};

export default config;