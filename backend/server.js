import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows to parse the body of request
app.use(cookieParser());

//import routes 
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
 

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port http://localhost:" + PORT);
  connectDB();

});
 