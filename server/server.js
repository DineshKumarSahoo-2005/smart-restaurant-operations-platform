import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";

dotenv.config();

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/inventory",inventoryRoutes);
app.use("/api/recipes",recipeRoutes);

app.get("/", (req, res) => {
    res.send("Smart Restaurant API is Running...");
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});