import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import errorHandler from "./middleware/errorHandler.js";
import { ensureUploadDirs } from "./utils/ensureUploadDirs.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";

// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect DB
connectDB();
ensureUploadDirs();

const app = express();
const server = http.createServer(app);

// ── CORS helper — allows localhost, local network IPs, and ngrok ─────────────
const isAllowedOrigin = (origin) => {
  if (!origin) return true; // mobile apps / curl / Postman have no origin
  if (origin.startsWith("http://localhost")) return true;
  if (origin.startsWith("http://127.0.0.1")) return true;
  if (origin.startsWith("http://192.168.")) return true; // local network
  if (origin.startsWith("http://10.")) return true; // local network
  if (origin.startsWith("http://172.")) return true; // local network
  if (origin.includes("ngrok")) return true; // ngrok tunnels
  if (origin.includes("ngrok-free.app")) return true; // ngrok free tier
  return false;
};

// ── Socket.IO setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available in all controllers via req.io
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ── Socket events ────────────────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  socket.on("join_user", (userId) => {
    socket.join(`user_${userId}`);
  });

  socket.on("join_conversation", (conversationId) => {
    socket.join(`conversation_${conversationId}`);
  });

  socket.on("leave_conversation", (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
  });

  socket.on("typing", ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit("typing", { userId });
  });

  socket.on("stop_typing", ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit("stop_typing", { userId });
  });

  // ── Call signaling ─────────────────────────────────────────────────────────
  socket.on(
    "start_call",
    ({ conversationId, callType, offer, from, callerName }) => {
      socket.to(`conversation_${conversationId}`).emit("incoming_call", {
        conversationId,
        callType,
        offer,
        from,
        callerName,
      });
    },
  );

  socket.on("answer_call", ({ conversationId, answer }) => {
    socket
      .to(`conversation_${conversationId}`)
      .emit("call_answered", { answer });
  });

  socket.on("ice_candidate", ({ conversationId, candidate }) => {
    socket
      .to(`conversation_${conversationId}`)
      .emit("ice_candidate", { candidate });
  });

  socket.on("end_call", ({ conversationId, leavingUserId }) => {
    socket
      .to(`conversation_${conversationId}`)
      .emit("peer_left", { leavingUserId });
  });

  socket.on("decline_call", ({ conversationId }) => {
    socket.to(`conversation_${conversationId}`).emit("call_declined");
  });

  socket.on("disconnect", () => {
    console.log(`🔌 Socket disconnected: ${socket.id}`);
  });
});

// ── Middleware ───────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static file serving ──────────────────────────────────────────────────────
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "1d",
    fallthrough: true,
  }),
);

// Clean JSON 404 for missing upload files
app.use("/uploads", (req, res) => {
  res.status(404).json({
    message: `File not found: ${req.path}`,
    hint: "The file may have been deleted or the path stored in the DB is wrong.",
  });
});

// ── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/activity", activityRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MINT API is running 🚀" });
});

// 404 for unknown API routes
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use(errorHandler);

// ── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
