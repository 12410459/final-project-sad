import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { apiRouter } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { checkDatabaseConnection, getDatabaseStatus } from "./repositories/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware global
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-User-Role", "X-User-Id"]
}));
app.use(express.json());

// Request logger sederhana (tanpa data sensitif)
app.use((req, res, next) => {
  const role = req.headers["x-user-role"] || "ANONYMOUS";
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Role: ${role}`);
  next();
});

// Root health & status check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    app: "Sistem Informasi Manajemen Bimbel Cerdas API",
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint status sistem untuk dikonsumsi frontend
app.get("/api/system/status", (req, res) => {
  res.json({
    success: true,
    data: getDatabaseStatus()
  });
});

// API Routes
app.use("/api", apiRouter);

// Serve static frontend build files jika tersedia (kemudahan deployment satu port / container)
const webDistPath = path.resolve(__dirname, "../../web/dist");
if (fs.existsSync(webDistPath)) {
  app.use(express.static(webDistPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path === "/health") {
      return next();
    }
    res.sendFile(path.join(webDistPath, "index.html"));
  });
}

// Global Error Handler
app.use(errorHandler);

// Jalankan Server
async function startServer() {
  await checkDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`🚀 Server Backend Bimbel Cerdas berjalan aktif di http://localhost:${PORT}`);
  });
}

startServer();
