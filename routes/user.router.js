import express from "express";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

import {
  loginUser,
  refreshToken,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();

// PUBLIC ROUTES
router.post("/register", createUser);   // Fixed
router.post("/login", loginUser);
router.post("/refresh", refreshToken);

// PROTECTED ROUTES
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);

// ADMIN ONLY ROUTES
router.put("/:id", authenticate, authorizeRole(["admin"]), updateUser);
router.delete("/:id", authenticate, authorizeRole(["admin"]), deleteUser);

export default router;
