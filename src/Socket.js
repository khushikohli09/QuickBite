// src/socket.js
import { io } from "socket.io-client";

export const socket = io("http://localhost:5000"); // change to your backend URL
export const registerSocketUser = (userId, role) => {
  socket.emit("register", { userId, role });
};
