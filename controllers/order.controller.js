import mongoose from "mongoose"; 
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

const orderValidator = z.object
({
  userId: z.string({ required_error: "User ID is required" }),
  items: z.array(
    z.object({
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

const fillItemsPrice = async (items) => {
  return await Promise.all(
    items.map(async (item) => {
      const cleanId = item.productId.trim(); 
      if (!mongoose.Types.ObjectId.isValid(cleanId)) {
        throw new Error(`Invalid product ID: ${cleanId}`);
      }
      const product = await Product.findById(cleanId);
      if (!product) throw new Error(`Product not found: ${cleanId}`);
      return { ...item, productId: cleanId, price: product.price };
    })
  );
};


export const getOrders = async (req, res) => {
  try 
  {
    const { userId } = req.query;
    const query = userId ? { userId: userId.trim() } : {};
    const orders = await Order.find(query)
      .populate("userId", "name email")
      .populate("items.productId", "name price category");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching orders", error: error.message });
  }
};


export const getOrder = async (req, res) => {
  try 
  {
    const id = req.params.id.trim(); 
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const order = await Order.findById(id)
      .populate("userId", "name email")
      .populate("items.productId", "name price");
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Error fetching order", error: error.message });
  }
};


export const createOrder = async (req, res) => {
  try 
  {
    const parsedData = orderValidator.parse(req.body);

    
    parsedData.userId = parsedData.userId.trim();
    parsedData.items = parsedData.items.map((item) => ({
      ...item,
      productId: item.productId.trim(),
    }));

    parsedData.items = await fillItemsPrice(parsedData.items); 
    const newOrder = new Order(parsedData);
    await newOrder.save();

    res.status(201).json({ message: "Order placed successfully", order: newOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error creating order", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try 
  {
    const parsedData = orderValidator.partial().parse(req.body);

    if (parsedData.items) {
      parsedData.items = parsedData.items.map((item) => ({
        ...item,
        productId: item.productId.trim(),
      }));
      parsedData.items = await fillItemsPrice(parsedData.items);
    }

    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) 
    {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, parsedData, { new: true });
    if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Error updating order", error: error.message });
  }
};


export const deleteOrder = async (req, res) => {
  try 
  {
    const id = req.params.id.trim();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }
    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting order", error: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try 
  {
    const userId = req.params.userId.trim();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const orders = await Order.find({ userId })
      .populate("items.productId", "name price")
      .sort({ createdAt: -1 });
    if (!orders.length) return res.status(404).json({ message: "No orders found for this user" });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user orders", error: error.message });
  }
};
