/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: [
    "./Index.tsx",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#FF6B00", // brand-primary
          light: "#FF8C3A",
          dark: "#CC5600",
        },
        slate: {
          950: "#0A0A0F",
        },
        accent: "#4F46E5", // single custom color
      },
    },
  },
  plugins: [],
};
