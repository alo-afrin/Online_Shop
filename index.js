import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouters from "./routes/user.router.js";
import productRoutes from "./routes/product.router.js";
import orderRoutes from "./routes/order.router.js";
import cartRoutes from "./routes/cart.router.js";


const port = process.env.PORT || 8000;
const app = express();
app.use(express.json());

dotenv.config()

mongoose.connect(process.env.MONGO_URI,{
useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(
    ()=>{console.log("MongoDB is Connected.")}).catch(
    (error)=>{console.log(error)})

app.use("/api/users",userRouters);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/carts", cartRoutes);

app.post("/api/users/seed", async (req, res) => {
  try
  {
    await User.deleteMany();

    // Insert all users
    const insertedUsers = await User.insertMany(users);

    res.status(201).json({
      message: "All users inserted successfully!",
      users: insertedUsers
    });
  } 
  catch (err) 
  {
    res.status(500).json({ message: err.message });
  }
});

app.listen(port,()=>{
    console.log(`Server is running in http://localhost:${port}`)
})


