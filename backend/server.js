import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose"; // 🧩 Add this

// ✅ Route Imports
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/product.js";
import chatRoutes from "./routes/chatRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import webhookRoutes from "./routes/webhookRoutes.js";
import walletRoutes from "./routes/wallet.js";
import adminAnalyticsRoutes from "./routes/adminAnalyticsRoutes.js";
import disputeRoutes from "./routes/disput.js";

// ✅ Utility Imports
import { initSocket } from "./utils/socket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// ✅ Socket.IO Initialization
const io = new Server(server, {
  cors: {
    origin: "*", // Change this in production
    methods: ["GET", "POST"],
  },
});

// ✅ Initialize global socket instance
initSocket(io);



// ✅ Proper CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,               // allow cookies / headers
  })
);

// ⚠️  express.json()
app.post(
  "/api/payments/webhook",
  bodyParser.raw({ type: "application/json" }),
  (req, res, next) => {
    req.isWebhook = true;
    next();
  }
);

// ✅ Use JSON parser for all other routes
app.use(express.json());

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/webhook", webhookRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/disputes", disputeRoutes);

// ✅ Socket.IO Events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // Join chat room
  socket.on("joinChat", (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  // Send & receive messages
  socket.on("sendMessage", ({ chatId, message }) => {
    io.to(chatId).emit("receiveMessage", message);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// ✅ MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB Connected Successfully");

    // Start server only after DB connection
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();
