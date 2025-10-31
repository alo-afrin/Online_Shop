import mongoose from "mongoose"; 
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";


const orderValidator = z.object
({
  userId: z.string({ required_error: "User ID is required" }),
  items: z.array(
    z.object
    ({
      productId: z.string({ required_error: "Product ID is required" }),
      quantity: z.number().int().positive("Quantity must be positive"),
      price: z.number().positive("Price must be positive").optional(),
    })
  ).min(1, "Order must contain at least one item"),
  paymentMethod: z.string().min(2, "Payment method is required"),
  status: z.enum(["pending", "processing", "shipped", "delivered", "cancelled"]).default("pending"),
  shippingAddress: z.object
  ({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    postalCode: z.string().optional(),
  }).optional(),
});

// Helper: populate price from product collection
const fillItemsPrice = async (items) => {
  return await Promise.all
  (
    items.map(async item => 
    {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return { ...item, price: product.price };
    })
  );
};

// Get all orders
export const getOrders = async (req, res) => {
  try 
  {
    const { userId } = req.query;
    const query = userId ? { userId } : {};
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price category");
    res.status(200).json(orders);
  } 
  catch (error)
  {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};

// Get single order
export const getOrder = async (req, res) => {
  try 
  {
    const order = await Order.findById(req.params.id)
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } 
  catch (error) 
  {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};

// Create order
export const createOrder = async (req, res) => {
  try 
  {
    const parsedData = orderValidator.parse(req.body);
    parsedData.items = parsedData.items.map(item => ({
      ...item,
      productId: mongoose.Types.ObjectId(item.productId)
    }));

    parsedData.items = await fillItemsPrice(parsedData.items); // auto-fill price
    const newOrder = new Order(parsedData);
    await newOrder.save();
    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } 
  catch (error) 
  {
    if (error instanceof z.ZodError) 
    {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

// Update order
export const updateOrder = async (req, res) => {
  try 
  {
    const parsedData = orderValidator.partial().parse(req.body);

    if (parsedData.items) 
    {
      parsedData.items = parsedData.items.map(item => ({
        ...item,
        productId: mongoose.Types.ObjectId(item.productId)
      }));

      parsedData.items = await fillItemsPrice(parsedData.items); // auto-fill price
    }

    const updatedOrder = await Order.findByIdAndUpdate(req.params.id, parsedData, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } 
  catch (error) 
  {
    if (error instanceof z.ZodError) 
    {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};

// Delete order
export const deleteOrder = async (req, res) => {
  try 
  {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } 
  catch (error)
  {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

// Get all orders of a user
export const getUserOrders = async (req, res) => {
  try 
  {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ message: "No orders found for this user" });
    res.status(200).json(orders);
  } 
  catch (error) 
  {
    res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};
