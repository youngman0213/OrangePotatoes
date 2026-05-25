import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", ".theme-dark"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        gangwon: {
          orange: "#f37021",
          navy: "#101827",
          ink: "#1f2937",
          mist: "#f6f7f9"
        }
      },
      boxShadow: {
        card: "0 12px 30px rgba(16, 24, 39, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
