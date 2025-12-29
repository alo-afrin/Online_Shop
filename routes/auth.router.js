import express from "express";
import { register, login, getProfile, logout,refreshToken } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticate, getProfile);
router.post("/logout", authenticate, logout);
router.post("/refresh-token", refreshToken);

export default router;
