import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, 
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }, 
        quantity: { type: Number, default: 1, min: 1 }, 
      },
    ],
    totalPrice: { type: Number, default: 0 }, 
    status: { type: String, enum: ["active", "ordered", "cancelled"], default: "active" }, 
  },
  {
    timestamps: true, 
  }
);


cartSchema.pre("save", async function (next) {
  if (this.items && this.items.length > 0) 
    {
    const Product = mongoose.model("Product");
    let total = 0;

    for (const item of this.items) 
    {
      const product = await Product.findById(item.productId);
      if (product) 
      {
        total += product.price * item.quantity;
      }
    }

    this.totalPrice = total;
  } else 
  {
    this.totalPrice = 0;
  }
  next();
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
