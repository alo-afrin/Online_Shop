import express from "express";
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/product.controller.js";

import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProduct);

// Admin Routes 
router.post(
  "/",
  authenticate,
  authorizeRole(["admin"]),
  createProduct
);

router.put(
  "/:id",
  authenticate,
  authorizeRole(["admin"]),
  updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorizeRole(["admin"]),
  deleteProduct
);

export default router;
