import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },           
    price: { type: Number, required: true },          
    description: { type: String },                    
    category: { type: String },                       
    stock: { type: Number, default: 0 },             
    isAvailable: { type: Boolean, default: true },   
    ratings: [{ type: Number }],                     
    imageUrl: { type: String },                       
  },
  {
    timestamps: true, 
  }
);


const Product = mongoose.model("Product", productSchema);
export default Product;
