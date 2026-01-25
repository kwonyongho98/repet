/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  
  // 다크 모드: 'class' 전략 사용 (HTML에 'dark' 클래스 추가로 전환)
  darkMode: 'class',
  
  theme: {
    extend: {
      colors: {
        // Repet 브랜드 컬러
        primary: {
          DEFAULT: "#F97316", // orange-500
          50: "#FFF7ED",
          100: "#FFEDD5",
          200: "#FED7AA",
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316", // 메인 주황
          600: "#EA580C",
          700: "#C2410C",
          800: "#9A3412",
          900: "#7C2D12",
        },
        secondary: {
          DEFAULT: "#1E3A8A", // blue-900
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#3B82F6",
          600: "#2563EB",
          700: "#1D4ED8",
          800: "#1E40AF",
          900: "#1E3A8A", // 메인 남색
          950: "#172554",
        },
        background: {
          DEFAULT: "#FFF7ED", // orange-50
          light: "#FFFBF5",
          // 다크 모드용 배경색
          dark: "#0f172a", // slate-900
          "dark-light": "#1e293b", // slate-800
        },
      },
    },
  },
  plugins: [],
};
