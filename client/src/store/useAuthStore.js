import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// const BASE_URL = "https://gossip.backend.wishalpha.com";
const BASE_URL = "http://localhost:7001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  connectSocket: () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const socket = io(BASE_URL, {
      auth: { token },
    });
    socket.on("connect");
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    socket.on("connect_error", (err) => {
      if (err.message.includes("Authentication error")) {
        toast.error("Session expired. Logging out...");
        localStorage.removeItem("token");
        set({ authUser: null });
        get().disconnectSocket();
      }
    });
    set({ socket });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      set({ authUser: null, isCheckingAuth: false });
      return;
    }
    const socket = io(BASE_URL, { auth: { token } });
    socket.connect();
    set({ socket });
    socket.emit("checkAuth", null, (response) => {
      if (response.success) {
        set({ authUser: response.user });
      } else {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        set({ authUser: null });
        get().disconnectSocket();
      }
      set({ isCheckingAuth: false });
    });
    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    socket.on("connect_error", (err) => {
      if (err.message.includes("Authentication error")) {
        toast.error("Session expired. Logging out...");
        localStorage.removeItem("token");
        set({ authUser: null });
        get().disconnectSocket();
      }
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
  },

  register: async (data) => {
    set({ isSigningUp: true });
    const socket = io(BASE_URL, {
      auth: {
        event: "register",
      },
    });
    socket.emit("register", data, (response) => {
      if (response.success) {
        set({ authUser: response.user });
        localStorage.setItem("token", response.user.token);
        toast.success("Account Created Successfully");
        socket.disconnect();
        get().connectSocket();
      } else {
        toast.error(response.error || "Registration failed");
        socket.disconnect();
      }
      set({ isSigningUp: false });
    });
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    const socket = io(BASE_URL, {
      auth: {
        event: "login",
      },
    });
    socket.emit("login", data, (response) => {
      if (response.success) {
        set({ authUser: response.user });
        localStorage.setItem("token", response.user.token);
        toast.success("Logged in Successfully");
        socket.disconnect();
        get().connectSocket();
      } else {
        toast.error(response.error || "Login failed");
        socket.disconnect();
      }
      set({ isLoggingIn: false });
    });
  },

  logout: async () => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit("logout", {}, (response) => {
      if (response.success) {
        set({ authUser: null });
        toast.success("Logged Out Successfully");
        get().disconnectSocket();
        localStorage.removeItem("token");
      } else {
        toast.error(response.error || "Logout failed");
      }
    });
  },

  update: async (data) => {
    const socket = get().socket;
    const userId = get().authUser?._id;
    set({ isUpdatingProfile: true });
    socket.emit("update", { ...data, userId }, (response) => {
      if (response.success) {
        set({ authUser: response.user });
        toast.success("Profile Updated Successfully");
      } else {
        toast.error(response.error || "Profile update failed");
      }
      set({ isUpdatingProfile: false });
    });
  },
}));
