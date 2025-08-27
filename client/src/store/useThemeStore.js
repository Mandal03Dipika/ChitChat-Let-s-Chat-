import { create } from "zustand";
import { themeBackgrounds } from "../constants";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  bgImage:
    themeBackgrounds[localStorage.getItem("chat-theme")] ||
    themeBackgrounds["coffee"],
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({
      theme,
      bgImage: themeBackgrounds[theme] || themeBackgrounds["coffee"],
    });
  },
}));
