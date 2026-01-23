import Category from "../models/category.model.js";
import { z } from "zod";

const categoryValidator = z.object({
  name: z.string().min(2, "Category name too short"),
  description: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
  isActive: z.boolean().optional(),
});
export const getCategories = async (req, res) => {
  try {
    const { search, isActive, page = 1, limit = 10 } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (isActive !== undefined) {
      query.isActive = isActive === "true";
    }

    const skip = (page - 1) * limit;

    const categories = await Category.find(query)
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: categories,
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
      message: "Error fetching categories",
      error: error.message,
    });
  }
};

export const getCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching category",
      error: error.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const validatedData = categoryValidator.parse(req.body);

    const existingCategory = await Category.findOne({
      name: { $regex: `^${validatedData.name}$`, $options: "i" },
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = new Category(validatedData);
    await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
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
      message: "Error creating category",
      error: error.message,
    });
  }
};
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = categoryValidator.partial().parse(req.body);

    const category = await Category.findByIdAndUpdate(id, validatedData, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
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
      message: "Error updating category",
      error: error.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting category",
      error: error.message,
    });
  }
};
