import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {

  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {

    console.log(`✅ Client Connected: ${socket.id}`);

    socket.on("joinKitchen", (restaurantId) => {
      socket.join(`kitchen-${restaurantId}`);
    });

    socket.on("joinManager", (restaurantId) => {
      socket.join(`manager-${restaurantId}`);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client Disconnected: ${socket.id}`);
    });

  });

};

export const getIO = () => io;