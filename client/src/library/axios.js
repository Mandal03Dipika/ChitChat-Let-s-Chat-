import axios from "axios";

export const axiosClient = axios.create({
  // baseURL: "https://gossip.backend.wishalpha.com/api",
  baseURL: "http://localhost:7001/api",
  withCredentials: true,
});
