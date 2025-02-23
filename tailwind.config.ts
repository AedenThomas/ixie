import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        zain: ["var(--font-zain)"],
        monomakh: ["var(--font-monomakh)"],
      },
      fontSize: {
        "zain-base": "1.6rem", // Set to exactly 1.6rem
        "title-lg": "3.8rem", // 20% larger than 4rem
        "subtitle-lg": "1.92rem", // 20% larger than 1.6rem
      },
    },
  },
  plugins: [],
} satisfies Config;
