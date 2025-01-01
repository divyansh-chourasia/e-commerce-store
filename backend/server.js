import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // allows to parse the body of request

//import routes 
import authRoutes from "./routes/auth.route.js"
 

app.use("/api/auth", authRoutes)

app.listen(PORT, () => {
  console.log("Server is running on port http://localhost:" + PORT);
  connectDB();

});
 