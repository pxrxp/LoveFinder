/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
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
        textPrimaryLight: "#000000",
        textPrimaryDark: "#ffffff",
        textSecondaryLight: "#808080",
        textSecondaryDark: "#d1d1d1",
      }
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
}
