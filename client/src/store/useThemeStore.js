import { create } from "zustand";
import { themeBackgrounds, themeChats } from "../constants";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee",
  bgImage:
    themeBackgrounds[localStorage.getItem("chat-theme")] ||
    themeBackgrounds["coffee"],
  chatImage:
    themeChats[localStorage.getItem("chat-theme")] || themeChats["coffee"],
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({
      theme,
      bgImage: themeBackgrounds[theme] || themeBackgrounds["coffee"],
      chatImage: themeChats[theme] || themeChats["coffee"],
    });
  },
}));
