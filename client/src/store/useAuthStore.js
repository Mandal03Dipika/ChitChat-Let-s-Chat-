import { create } from "zustand";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const BASE_URL = "https://gossip.backend.wishalpha.com";
// const BASE_URL = "http://localhost:7001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  onlineFriends: [],
  socket: null,

  isVerifyingOtp: false,

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
    socket.on("forceLogout", (data) => {
      toast.error(data.message || "You have been logged out.");
      localStorage.removeItem("token");
      set({ authUser: null });
      get().disconnectSocket();
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

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket?.connected) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
    }
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
    socket.on("forceLogout", (data) => {
      toast.error(data.message || "You have been logged out.");
      localStorage.removeItem("token");
      set({ authUser: null });
      get().disconnectSocket();
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

  register: async (data, callback) => {
    set({ isSigningUp: true });
    const socket = io(BASE_URL, {
      auth: {
        event: "register",
      },
    });
    socket.emit("register", data, (response) => {
      if (response.success) {
        toast.success("OTP sent to your email. Please verify.");
        set({ tempUserId: response.userId });
        if (callback) callback(response);
      } else {
        toast.error(response.error || "Registration failed");
        if (callback) callback(response);
        socket.disconnect();
      }
      set({ isSigningUp: false });
    });
  },

  verifyOtp: async ({ email, otp }, onSuccess) => {
    set({ isVerifyingOtp: true });
    const socket = io(BASE_URL, { auth: { event: "verifyOtp" } });
    socket.emit("verifyOtp", { email, otp }, (response) => {
      if (response.success) {
        set({ authUser: response.user });
        localStorage.setItem("token", response.user.token);
        toast.success("Account verified successfully!");
        socket.disconnect();
        get().connectSocket();
        if (onSuccess) onSuccess();
      } else {
        toast.error(response.error || "OTP verification failed");
        socket.disconnect();
      }
      set({ isVerifyingOtp: false, tempUserId: null });
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

  forgotPassword: async (email, callback) => {
    const socket = io(BASE_URL, { auth: { event: "forgotPassword" } });
    socket.emit("forgotPassword", { email }, (response) => {
      if (response.success) {
        toast.success("OTP sent to your email for password reset.");
        if (callback) callback(response);
      } else {
        toast.error(response.error || "Failed to send reset OTP");
      }
      socket.disconnect();
    });
  },

  verifyResetOtp: async ({ email, otp }, callback) => {
    const socket = io(BASE_URL, { auth: { event: "verifyResetOtp" } });
    socket.emit("verifyResetOtp", { email, otp }, (response) => {
      if (response.success) {
        toast.success("OTP verified! You can now reset your password.");
        if (callback) callback(response);
      } else {
        toast.error(response.error || "Invalid or expired OTP");
      }
      socket.disconnect();
    });
  },

  resetPassword: async ({ email, newPassword }, callback) => {
    const socket = io(BASE_URL, { auth: { event: "resetPassword" } });
    socket.emit("resetPassword", { email, newPassword }, (response) => {
      if (response.success) {
        toast.success("Password reset successfully! Please login again.");
        if (callback) callback(response);
      } else {
        toast.error(response.error || "Failed to reset password");
      }
      socket.disconnect();
    });
  },

  resendOtp: async (email, callback) => {
    const socket = io(BASE_URL, { auth: { event: "resendOtp" } });
    socket.emit("resendOtp", { email }, (response) => {
      if (response.success) {
        toast.success("OTP resent to your email.");
        if (callback) callback(response);
      } else {
        toast.error(response.error || "Failed to resend OTP");
      }
      socket.disconnect();
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

  getOnlineFriends: () => {
    const socket = get().socket;
    if (!socket) return;
    socket.emit("getOnlineFriends", {}, (response) => {
      if (response.success) {
        set({ onlineFriends: response.friends });
      } else {
        toast.error(response.error || "Failed to fetch online friends");
      }
    });
  },
}));
