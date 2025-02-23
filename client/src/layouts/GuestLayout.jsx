import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { useAuthStore } from "../store/useAuthStore";
import { Loader } from "lucide-react";
import { useEffect } from "react";

function GuestLayout() {
  const { theme } = useThemeStore();

  return (
    <>
      <div data-theme={theme}>
        <Navbar />
        <main>
          <Outlet />
        </main>
        <Toaster />
      </div>
    </>
  );
}

export default GuestLayout;
