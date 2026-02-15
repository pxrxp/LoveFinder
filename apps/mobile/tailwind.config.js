/** @type {import('tailwindcss').Config} */
const { colors: colorMap } = require("./constants/colors");

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        regular: ["OpenSans-Regular"],
        bold: ["OpenSans-Bold"],
        italic: ["OpenSans-Italic"],
        semiBold: ["OpenSans-SemiBold"],
        semiBoldItalic: ["OpenSans-SemiBoldItalic"],
        light: ["OpenSans-Light"],
        condensed: ["OpenSans-Condensed-Regular"],
        condensedBold: ["OpenSans-Condensed-Bold"],
        semiCondensed: ["OpenSans-SemiCondensed-Regular"],
        semiCondensedBold: ["OpenSans-SemiCondensed-Bold"],
      },
      colors: {
        textPrimaryLight: colorMap.light.textPrimary,
        textPrimaryDark: colorMap.dark.textPrimary,
        textSecondaryLight: colorMap.light.textSecondary,
        textSecondaryDark: colorMap.dark.textSecondary,
        bgPrimaryLight: colorMap.light.bgPrimary,
        bgPrimaryDark: colorMap.dark.bgPrimary,
        chatBgLight: colorMap.light.chatBg,
        chatBgDark: colorMap.dark.chatBg,
        accent: colorMap.light.accent,
      },
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
  darkMode: "class",
};

