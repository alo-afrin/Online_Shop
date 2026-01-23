import Review from "../models/review.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

/* =======================
   Zod Review Validator
======================= */
const reviewValidator = z.object({
  productId: z.string().min(1, "Product ID required"),
  rating: z.number().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().min(3, "Review title too short"),
  comment: z.string().optional(),
  isVerifiedPurchase: z.boolean().optional(),
});

/* =======================
   Get All Reviews
======================= */
export const getReviews = async (req, res) => {
  try {
    const { productId, userId, minRating, page = 1, limit = 10 } = req.query;

    const query = {};

    if (productId) {
      query.productId = productId;
    }

    if (userId) {
      query.userId = userId;
    }

    if (minRating) {
      query.rating = { $gte: Number(minRating) };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("userId", "username email")
      .populate("productId", "name imageUrl")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reviews",
      error: error.message,
    });
  }
};

/* =======================
   Get Product Reviews
======================= */
export const getProductReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find({ productId: id })
      .populate("userId", "username email")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Review.countDocuments({ productId: id });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(2)
        : 0;

    res.status(200).json({
      success: true,
      data: {
        reviews,
        averageRating,
      },
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching product reviews",
      error: error.message,
    });
  }
};

/* =======================
   Get Single Review
======================= */
export const getReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate("userId", "username email")
      .populate("productId", "name imageUrl");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching review",
      error: error.message,
    });
  }
};

/* =======================
   Create Review
======================= */
export const createReview = async (req, res) => {
  try {
    const validatedData = reviewValidator.parse(req.body);

    const product = await Product.findById(validatedData.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const existingReview = await Review.findOne({
      productId: validatedData.productId,
      userId: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    const review = new Review({
      ...validatedData,
      productId: validatedData.productId,
      userId: req.user.id,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: review,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error creating review",
      error: error.message,
    });
  }
};

/* =======================
   Update Review
======================= */
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = reviewValidator.partial().parse(req.body);

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    const updatedReview = await Review.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: updatedReview,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Error updating review",
      error: error.message,
    });
  }
};

/* =======================
   Delete Review
======================= */
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    if (review.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting review",
      error: error.message,
    });
  }
};

/* =======================
   Mark Review as Helpful
======================= */
export const markReviewHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { $inc: { helpful: 1 } },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review marked as helpful",
      data: review,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error marking review as helpful",
      error: error.message,
    });
  }
};
