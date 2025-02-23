import axios from "axios";

export const axiosClient = axios.create({
  baseURL: "http://localhost:7001/api",
  withCredentials: true,
});
