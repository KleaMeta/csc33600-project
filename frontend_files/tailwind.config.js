/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#F00C00",
        secondary: "#F59E0B",
        dark: "#111827",
        lightGray: "#F3F4F6",
      },
      fontFamily: {
        logo: ['Pacifico', 'cursive'],
      },
    },
  },
  plugins: [],
};
