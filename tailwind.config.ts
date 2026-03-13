import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-page": "#F5F5F7",
        "bg-surface": "#FFFFFF",
        "border-subtle": "#E4E7EC",
        "text-main": "#101828",
        "text-secondary": "#667085",
        "icon-muted": "#98A2B3",
        "header-bg": "#0F4C81",
        "header-accent": "#7DD3FC",
        primary: {
          DEFAULT: "#2563EB",
          soft: "#EFF4FF",
          border: "#D0E2FF",
        },
        status: {
          planificado: "#64748B",
          "planificado-bg": "#E2E8F0",
          en_marcha: "#2563EB",
          "en_marcha-bg": "#DBEAFE",
          finalizado: "#16A34A",
          "finalizado-bg": "#DCFCE7",
          cancelado: "#DC2626",
          "cancelado-bg": "#FEE2E2",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "SF Pro Text", "system-ui", "sans-serif"],
      },
      borderRadius: {
        xs: "4px",
        md: "8px",
        lg: "12px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15, 23, 42, 0.06)",
        modal: "0 10px 40px rgba(15, 23, 42, 0.16)",
        tooltip: "0 10px 40px rgba(15, 23, 42, 0.24)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
