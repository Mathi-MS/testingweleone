/** @type {import('tailwindcss').Config} */
export default {
  important: "#root",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        DMSans: ["DMSans", "sans-serif"],
      },
      colors: {
        primary: "#005AFF", // bright blue
        background: "#EAF2FF", // light blue background
        border: "#CED4DA", // neutral border
        "dark-gray": "#343A40", // dark gray text
        "lite-gray": "#8E8E8E", // dark gray text
        accent: "#1265FE", // alternate blue accent
        "text-gray": "#919EAB",
        "black-10": "#0000001A",
        "black-30": "#0000004D",
        "black-50": "#00000080",
        "black-60": "##00000099",
        "black-80": "#000000CC",
        thead: "#EDF3FD",
        "lite-gray-bg": "#F2F2F280",
        "file-name": "#888888",
        icon: "#8E8E8E",
        "icon-lite": "#a7a9ab2e",
        "delete": "#FF2826",
        "delete-lite": "#FF28261A",
        "form-btn": "#F8F9FA",
        "card-hover": "#EFF6FF",
        thead: "#EDF3FD",
        "btn-danger": "#E95151",
      },
      borderColor: {
        default: "#DEDEDE",
        table: "#CED4DA",
      },
    },
  },
  plugins: [],
};
