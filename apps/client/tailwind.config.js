/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Định nghĩa dải màu Cam Gradient hiển thị Modern Web
        primary: {
          DEFAULT: "#f97316", // orange-500
          glow: "#fdba74", // orange-300
          dark: "#c2410c", // orange-700
        },
      },
      backgroundImage: {
        "gradient-primary":
          "linear-gradient(to right top, #f97316, #fb923c, #fcd34d)",
      },
    },
  },
  plugins: [],
};
