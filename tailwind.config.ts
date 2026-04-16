import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#16110e",
        sand: "#efe2cf",
        cream: "#f7efe2",
        ember: "#b35c34",
        merlot: "#5f1f24",
        lager: "#d9a441",
        pine: "#283128"
      },
      boxShadow: {
        glow: "0 25px 60px rgba(179, 92, 52, 0.16)",
        card: "0 18px 40px rgba(16, 11, 8, 0.12)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(217,164,65,0.32), transparent 35%), radial-gradient(circle at 80% 20%, rgba(179,92,52,0.25), transparent 30%), linear-gradient(135deg, #16110e 0%, #261714 45%, #5f1f24 100%)",
        "paper-glow":
          "linear-gradient(180deg, rgba(247,239,226,0.96), rgba(239,226,207,0.9))"
      }
    }
  },
  plugins: []
};

export default config;
