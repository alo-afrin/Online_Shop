import express from "express";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

//Public Routes 
router.get("/", getCategories);
router.get("/:id", getCategory);

//Admin Routes 
router.post(
  "/",
  authenticate,
  authorizeRole(["admin"]),
  createCategory
);

router.put(
  "/:id",
  authenticate,
  authorizeRole(["admin"]),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole(["admin"]),
  deleteCategory
);

export default router;
