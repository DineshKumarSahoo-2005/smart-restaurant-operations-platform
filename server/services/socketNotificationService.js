import { getIO } from "../config/socket.js";

export const notifyKitchen = (restaurantId, event, payload) => {

  const io = getIO();

  io.to(`kitchen-${restaurantId}`).emit(
    event,
    payload
  );

};

export const notifyManager = (restaurantId, event, payload) => {

  const io = getIO();

  io.to(`manager-${restaurantId}`).emit(
    event,
    payload
  );

};