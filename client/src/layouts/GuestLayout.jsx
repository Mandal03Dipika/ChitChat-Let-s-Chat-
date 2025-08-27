import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";

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
