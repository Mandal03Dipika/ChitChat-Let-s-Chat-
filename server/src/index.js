import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./library/socket.js";

dotenv.config();

const PORT = process.env.PORT;
const DB_URL = process.env.DB_URL;

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

app.get("/", (req, res) => {
  res.send("Gossip backend is working properly socket.js.");
});

mongoose
  .connect(DB_URL)
  .then(() => {
    console.log("DB Connected");
    server.listen(PORT, () => {
      console.log(`Server Connected On Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error.message);
  });
