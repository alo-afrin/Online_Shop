import User from "../models/user.model.js";
import { z } from "zod";
import bcrypt from "bcryptjs";  

const userValidator = z.object({
  username: z.string().min(2, "Name is too short."),
  email: z.string().email("Invalid email address."),
  age: z.number().int().positive("Age must be a positive integer."),
  password: z.string().min(6,"at least 6 charecter"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

const userUpdateValidator = z.object({
  username: z.string().optional(),
  email: z.string().email().optional(),
  age: z.number().optional(),
  password: z.string().min(6).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
  }).optional(),
});

// GET ALL USERS
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

// GET SINGLE USER
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

// CREATE USER / REGISTER

export const createUser = async (req, res) => {
  try {
    const parsedData = userValidator.parse(req.body);
    const hashedPassword = await bcrypt.hash(parsedData.password, 10);
    parsedData.password = hashedPassword;

    const newUser = await User.create(parsedData);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Error creating user", error: error.message });
  }
};

// UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const parsedData = userUpdateValidator.parse(req.body);
    if (parsedData.password) {
      parsedData.password = await bcrypt.hash(parsedData.password, 10);
    }


    const updatedUser = await User.findByIdAndUpdate(userId, parsedData, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    const { createdAt, updatedAt, __v, ...userWithoutTimestamps } = updatedUser.toObject();
    res.status(200).json(userWithoutTimestamps);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};
