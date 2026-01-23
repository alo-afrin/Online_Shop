import express from "express";
import {
  getReviews,
  getProductReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
  markReviewHelpful,
} from "../controllers/review.controller.js";

import { authenticate, authorizeRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

/* ===== Public Routes ===== */
router.get("/", getReviews);
router.get("/product/:id", getProductReviews);
router.get("/:id", getReview);

/* ===== User Routes ===== */
router.post(
  "/",
  authenticate,
  createReview
);

router.put(
  "/:id",
  authenticate,
  updateReview
);

router.delete(
  "/:id",
  authenticate,
  deleteReview
);

/* ===== Helpful Route ===== */
router.patch(
  "/:id/helpful",
  markReviewHelpful
);

export default router;
