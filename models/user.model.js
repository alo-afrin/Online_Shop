import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },                  
    email: { type: String, required: true, unique: true },  
    age: { type: Number, required: true },                  
    password: { type: String, required: true },             
    address: {                                             
      street: { type: String },
      city: { type: String },
      country: { type: String },
    },

  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model("User", userSchema);
export default User;
