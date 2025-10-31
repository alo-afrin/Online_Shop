import mongoose from "mongoose";
import Product from "../models/product.model.js"; 

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number },
      },
    ],
    totalAmount: { type: Number },
    shippingAddress: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      postalCode: { type: String },
    },
    paymentMethod: { type: String, enum: ["card", "cash on delivery", "paypal"], default: "card" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    orderStatus: { type: String, enum: ["processing", "shipped", "delivered", "cancelled"], default: "processing" },
    orderDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

orderSchema.pre("save", async function (next) {
  try
   {
    if (this.items && Array.isArray(this.items) && this.items.length > 0) 
      {
      for (const item of this.items) 
        {
        if (!item.price) 
          {
          const product = await mongoose.model("Product").findById(item.productId);
          if (!product) 
          {
            console.warn(`Product not found for ID: ${item.productId}. Setting price to 0.`);
            item.price = 0; 
            continue;
          }
          item.price = product.price;
        }
      }

      this.totalAmount = this.items.reduce
      (
        (total, item) => total + item.price * item.quantity,
        0
      );
    }
    next();
  } catch (err) {
    next(err);
  }
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
