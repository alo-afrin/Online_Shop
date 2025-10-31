import Product from "../models/product.model.js";
import { z } from "zod";

const productValidator = z.object
({
  name: z.string().min(2, "Product name too short"),
  price: z.number().positive("Price must be positive"),
  description: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().int().nonnegative("Stock must be zero or positive").optional(),
  isAvailable: z.boolean().optional(),
  ratings: z.array(z.number()).optional(),
  imageUrl: z.string().url("Invalid image URL").optional()
});

//  Get all products
export const getProducts = async (req, res) => {
  try
  {
    const products = await Product.find(); 
    res.status(200).json(products);
  } 
  catch (error) 
  {
    res.status(500).json
    ({
      message: "Error fetching products",
      error: error.message,
    });
  }
};

// Get single product by ID
export const getProduct = async (req, res) => {
  try 
  {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product)
    {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } 
  catch (error) 
  {
    res.status(500).json({
      message: "Error fetching product",
      error: error.message,
    });
  }
};

//  Create a new product
export const createProduct = async (req, res) => {
  try 
  {
    const parsedData = productValidator.parse(req.body);

    const newProduct = await Product.create(parsedData);

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
    });
  } 
  catch (error) 
  {
    if (error instanceof z.ZodError) 
    {
      return res.status(400).json
      ({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json
    ({
      message: "Error creating product",
      error: error.message,
    });
  }
};

//  Update product by ID
export const updateProduct = async (req, res) => {
  try 
  {
    const { id } = req.params;

    const parsedData = productValidator.partial().parse(req.body);

    const updatedProduct = await Product.findByIdAndUpdate(id, parsedData, 
    {
      new: true,
    });

    if (!updatedProduct) 
    {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json
    ({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } 
  catch (error) 
  {
    if (error instanceof z.ZodError) 
    {
      return res.status(400).json
      ({
        message: "Validation failed",
        errors: error.errors,
      });
    }

    res.status(500).json
    ({
      message: "Error updating product",
      error: error.message,
    });
  }
};

// Delete product by ID
export const deleteProduct = async (req, res) => {
  try 
  {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct)
    {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } 
  catch (error) 
  {
    res.status(500).json
    ({
      message: "Error deleting product",
      error: error.message,
    });
  }
};
