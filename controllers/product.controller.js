import Product from "../models/product.model.js";
import { z } from "zod";

/* =======================
   Zod Product Validator
======================= */
const productValidator = z.object({
  name: z.string().min(2, "Product name too short"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().int().nonnegative("Stock must be zero or positive").optional(),
  isAvailable: z.boolean().optional(),
  ratings: z.array(z.number()).optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

/* =======================
   Get All Products
   Search + Filter + Sort + Pagination
======================= */
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      sort = "latest",
      page = 1,
      limit = 5,
    } = req.query;

    const query = {};

    // 🔍 Search by name
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // 📦 Filter by category
    if (category) {
      query.category = category;
    }

    // 💰 Price filter
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // 🔃 Sorting
    let sortOption = {};
    if (sort === "price-low") {
      sortOption = { price: 1 };
    } else if (sort === "price-high") {
      sortOption = { price: -1 };
    } else {
      sortOption = { createdAt: -1 }; // latest
    }

    // 📄 Pagination
    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

/* =======================
   Get Single Product
======================= */
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

/* =======================
   Create Product
======================= */
export const createProduct = async (req, res) => {
  try {
    const parsedData = productValidator.parse(req.body);

    const newProduct = await Product.create(parsedData);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Error creating product",
      error: error.message,
    });
  }
};

/* =======================
   Update Product
======================= */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const parsedData = productValidator.partial().parse(req.body);

    const updatedProduct = await Product.findByIdAndUpdate(id, parsedData, {
      new: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json({
      message: "Error updating product",
      error: error.message,
    });
  }
};

/* =======================
   Delete Product
======================= */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting product",
      error: error.message,
    });
  }
};
