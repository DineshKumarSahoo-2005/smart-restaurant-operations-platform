import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import morgan from "morgan";

import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

import connectDB from "./config/db.js";
import { initializeSocket } from "./config/socket.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

import testRoutes from "./routes/testRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import wasteRoutes from "./routes/wasteRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/waste", wasteRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Centralized error handler
app.use(errorHandler);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("Smart Restaurant API is Running...");
});

server.listen(PORT, () => {
  console.log(`Server Running on http://localhost:${PORT}`);
});
