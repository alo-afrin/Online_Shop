import express from "express";
const router = express.Router();
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

const cartValidator = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  items: z.array
  (
    z.object
    ({
      productId: z.string({ required_error: "Product ID is required" }),
      quantity: z.number().int().positive({ message: "Quantity must be positive" }),
    })
  ),
});


router.get("/", async (req, res) => {
  try 
  {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const carts = await Cart.find(query).populate("items.productId", "name price");
    res.status(200).json(carts);
  }
   catch (error) 
   {
    res.status(500).json({ message: "Failed to fetch carts", error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try 
  {
    const cart = await Cart.findById(req.params.id).populate("items.productId", "name price");
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  }
   catch (error) 
   {
    res.status(500).json({ message: "Failed to fetch cart", error: error.message });
  }
});


router.get("/user/:userId", async (req, res) => {
  try 
  {
    const cart = await Cart.findOne({ userId: req.params.userId }).populate("items.productId", "name price");
    if (!cart) return res.status(404).json({ message: "Cart not found for this user" });
    res.status(200).json(cart);
  } 
  catch (error) 
  {
    res.status(500).json({ message: "Failed to fetch user's cart", error: error.message });
  }
});

router.post("/", async (req, res) => {
  try 
  {
    const parsed = cartValidator.parse(req.body);

    let totalPrice = 0;
    for (const item of parsed.items) 
    {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      totalPrice += product.price * item.quantity;
    }

    const newCart = new Cart({ ...parsed, totalPrice });
    await newCart.save();
    res.status(201).json(newCart);
  } 
  catch (error) 
  {
    if (error.name === "ZodError") 
    {
      res.status(400).json({ message: "Invalid input", errors: error.errors });
    } else 
      {
      res.status(500).json({ message: "Failed to create cart", error: error.message });
    }
  }
});


router.put("/:id", async (req, res) => {
  try 
  {
    const parsed = cartValidator.partial().parse(req.body);
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    if (parsed.items) 
    {
      cart.items = parsed.items;
      let totalPrice = 0;
      for (const item of cart.items) 
      {
        const product = await Product.findById(item.productId);
        if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
        totalPrice += product.price * item.quantity;
      }
      cart.totalPrice = totalPrice;
    }

    if (parsed.userId) cart.userId = parsed.userId;

    await cart.save();
    res.status(200).json(cart);
  } 
  catch (error) 
  {
    if (error.name === "ZodError") 
    {
      res.status(400).json({ message: "Invalid input", errors: error.errors });
    } else
     {
      res.status(500).json({ message: "Failed to update cart", error: error.message });
    }
  }
});

router.delete("/:id", async (req, res) => {
  try 
  {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ message: "Cart deleted successfully" });
  } 
  catch (error) 
  {
    res.status(500).json({ message: "Failed to delete cart", error: error.message });
  }
});

router.delete("/clear/:userId", async (req, res) => {
  try 
  {
    const cart = await Cart.findOne({ userId: req.params.userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();
    res.status(200).json({ message: "Cart cleared successfully", cart });
  } 
  catch (error) 
  {
    res.status(500).json({ message: "Failed to clear cart", error: error.message });
  }
});

export default router;
