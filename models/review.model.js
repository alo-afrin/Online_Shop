import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: { type: String, required: true },
    comment: { type: String },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
