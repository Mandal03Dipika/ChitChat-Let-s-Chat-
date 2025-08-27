import { useThemeStore } from "../store/useThemeStore";
import Navbar from "../components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function DefaultLayout() {
  const { theme } = useThemeStore();
  const { authUser } = useAuthStore();

  if (!authUser) {
    return <Navigate to="/login" />;
  }

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

export default DefaultLayout;
