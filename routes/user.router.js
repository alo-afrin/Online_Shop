import express from "express";
import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

import {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser
} from "../controllers/user.controller.js";

const router = express.Router();


router.post("/register", createUser);
router.post("/",createUser);

router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUser);


router.put("/:id", authenticate, updateUser);
router.delete("/:id", authenticate, deleteUser);

export default router;
