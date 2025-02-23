import express from "express";
import {
  register,
  login,
  logout,
  update,
  checkAuth,
} from "../controllers/authController.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.put("/update", protectRoute, update);
router.get("/check", protectRoute, checkAuth);

export default router;
