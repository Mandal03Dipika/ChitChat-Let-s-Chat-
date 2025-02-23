/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "retro",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "luxury",
      "dracula",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "sunset",
    ],
  },
};
