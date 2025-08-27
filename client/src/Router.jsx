import { createBrowserRouter } from "react-router-dom";
import DefaultLayout from "./layouts/DefaultLayout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import GuestLayout from "./layouts/GuestLayout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Setting from "./pages/Setting";
import Contacts from "./pages/Contacts";

const Router = createBrowserRouter([
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "users",
        element: <Contacts />,
      },
    ],
  },
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "settings",
        element: <Setting />,
      },
    ],
  },
]);

export default Router;
