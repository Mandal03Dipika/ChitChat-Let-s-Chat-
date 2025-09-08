import { Server } from "socket.io";
import http from "http";
import express from "express";
import * as authController from "../controllers/authController.js";
import * as groupController from "../controllers/groupController.js";
import * as messageController from "../controllers/messageController.js";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    credentials: true,
  },
});

app.get("/", (req, res) => {
  res.send("Gossip backend is working properly socket.js.");
});

const userSocketMap = {};

export const onlineUsers = new Map();

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.use((socket, next) => {
  const event = socket.handshake?.auth?.event;
  if (
    event === "login" ||
    event === "register" ||
    event === "verifyOtp" ||
    event === "forgotPassword" ||
    event === "verifyResetOtp" ||
    event === "resetPassword" ||
    event === "resendOtp"
  ) {
    return next();
  }
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication error: No token provided"));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    if (err.name === "TokenExpiredError") {
      socket.emit("forceLogout", {
        message: "Session expired. Please login again.",
      });
      socket.disconnect();
    }
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  const userId = socket.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    onlineUsers.set(userId, socket.id);
  }
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("register", (data, callback) =>
    authController.register(socket, data, callback)
  );
  socket.on("verifyOtp", (data, callback) =>
    authController.verifyOtp(socket, data, callback)
  );
  socket.on("resendOtp", (data, callback) =>
    authController.resendOtp(socket, data, callback)
  );
  socket.on("login", (data, callback) =>
    authController.login(socket, data, callback)
  );
  socket.on("forgotPassword", (data, callback) =>
    authController.forgotPassword(socket, data, callback)
  );
  socket.on("verifyResetOtp", (data, callback) =>
    authController.verifyResetOtp(socket, data, callback)
  );
  socket.on("resetPassword", (data, callback) =>
    authController.resetPassword(socket, data, callback)
  );
  socket.on("logout", (data, callback) =>
    authController.logout(socket, data, callback)
  );
  socket.on("update", (data, callback) =>
    authController.update(socket, data, callback)
  );
  socket.on("checkAuth", (data, callback) =>
    authController.checkAuth(socket, callback)
  );

  socket.on("createGroup", (data, callback) =>
    groupController.createGroup(socket, data, callback)
  );
  socket.on("updateGroup", (data, callback) =>
    groupController.updateGroup(socket, data, callback)
  );
  socket.on("deleteGroup", (data, callback) =>
    groupController.deleteGroup(socket, data, callback)
  );
  socket.on("getGroup", (data, callback) =>
    groupController.getGroup(socket, data, callback)
  );
  socket.on("getAllGroup", (data, callback) =>
    groupController.getAllGroup(socket, data, callback)
  );

  socket.on("sendMessage", (data, callback) =>
    messageController.sendMessage(socket, data, callback)
  );
  socket.on("sendGroupMessage", (data, callback) =>
    messageController.sendGroupMessage(socket, data, callback)
  );
  socket.on("getUsersForSidebar", (data, callback) =>
    messageController.getUsersForSidebar(socket, data, callback)
  );
  socket.on("deleteAllChats", (data, callback) =>
    messageController.deleteAllChats(socket, data, callback)
  );
  socket.on("blockUser", (data, callback) =>
    messageController.blockUser(socket, data, callback)
  );
  socket.on("unblockUser", (data, callback) =>
    messageController.unblockUser(socket, data, callback)
  );
  socket.on("getMessages", (data, callback) =>
    messageController.getMessages(socket, data, callback)
  );
  socket.on("getGroupMessages", (data, callback) =>
    messageController.getGroupMessages(socket, data, callback)
  );
  socket.on("getGroupsForSidebar", (data, callback) =>
    messageController.getGroupsForSidebar(socket, data, callback)
  );
  socket.on("getUser", (data, callback) =>
    messageController.getUser(socket, data, callback)
  );
  socket.on("leaveGroup", (data, callback) =>
    messageController.leaveGroup(socket, data, callback)
  );
  socket.on("sendFriendRequest", (data, callback) =>
    messageController.sendFriendRequest(socket, data, callback)
  );
  socket.on("acceptFriendRequest", (data, callback) =>
    messageController.acceptFriendRequest(socket, data, callback)
  );
  socket.on("rejectFriendRequest", (data, callback) =>
    messageController.rejectFriendRequest(socket, data, callback)
  );
  socket.on("cancelFriendRequest", (data, callback) =>
    messageController.cancelFriendRequest(socket, data, callback)
  );
  socket.on("toggleFriendRequest", (data, callback) =>
    messageController.toggleFriendRequest(socket, data, callback)
  );
  socket.on("unfriendUser", (data, callback) =>
    messageController.unfriendUser(socket, data, callback)
  );
  socket.on("getFriendRequests", (data, callback) =>
    messageController.getFriendRequests(socket, data, callback)
  );
  socket.on("getFriends", (data, callback) =>
    messageController.getFriends(socket, data, callback)
  );
  socket.on("getOnlineFriends", (data, callback) =>
    authController.getOnlineFriends(socket, data, callback)
  );

  socket.on("disconnect", () => {
    if (socket.userId) {
      delete userSocketMap[socket.userId];
      onlineUsers.delete(socket.userId);
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
