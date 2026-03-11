/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0A1628",
        blue: "#1B4FD8",
        green: "#00A86B",
        amber: "#F59E0B",
        red: "#EF4444",
        bg: "#F7F8FC",
        border: "#E5E7EB",
        gray: "#6B7280",
      },
      fontFamily: {
        display: ["'DM Sans'", "sans-serif"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      borderRadius: {
        card: "14px",
        button: "8px",
        badge: "20px",
      },
      boxShadow: {
        card: "0 1px 4px rgba(0,0,0,0.05)",
        modal: "0 20px 60px rgba(0,0,0,0.15)",
      },
    },
  },
  plugins: [],
};
