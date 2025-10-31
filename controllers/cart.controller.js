import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

const cartValidator = z.object
({
  userId: z.string(),
  items: z.array(
    z.object
    ({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});


export const getCarts = async (req, res) => {
  try 
  {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
};

export const getCart = async (req, res) => {
  try 
  {
    const cart = await Cart.findById(req.params.id);
    if (!cart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(cart);
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
};

// Create a new cart
export const createCart = async (req, res) => {
  try 
  {
    const validatedData = cartValidator.parse(req.body);

    let totalPrice = 0;
    for (const item of validatedData.items)
    {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      totalPrice += product.price * item.quantity;
    }

    const newCart = new Cart({ ...validatedData, totalPrice });
    await newCart.save();
    res.status(201).json(newCart);
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
};

// Update a cart
export const updateCart = async (req, res) => {
  try 
  {
    const { items } = req.body;
    const validatedItems = z.array
    (
      z.object
      ({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    ).parse(items);

    let totalPrice = 0;
    for (const item of validatedItems)
    {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ message: `Product ${item.productId} not found` });
      totalPrice += product.price * item.quantity;
    }

    const updatedCart = await Cart.findByIdAndUpdate(
      req.params.id,
      { items: validatedItems, totalPrice },
      { new: true }
    );

    if (!updatedCart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json(updatedCart);
  } 
  catch (error) 
  {
    res.status(400).json({ message: error.message });
  }
};

// Delete a cart
export const deleteCart = async (req, res) => {
  try 
  {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart) return res.status(404).json({ message: "Cart not found" });
    res.status(200).json({ message: "Cart deleted successfully" });
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
};

// Clear a user's cart
export const clearCart = async (req, res) => {
  try 
  {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json(cart);
  } 
  catch (error) 
  {
    res.status(500).json({ message: error.message });
  }
};
