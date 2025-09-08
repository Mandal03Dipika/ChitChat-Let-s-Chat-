import { io } from "socket.io-client";

let socket;

export const initSocket = (userId) => {
  socket = io(
    "https://gossip.backend.wishalpha.com/api",
    // "http://localhost:7001/api",
    {
      query: { userId },
      withCredentials: true,
    }
  );
};

export const getSocket = () => socket;
