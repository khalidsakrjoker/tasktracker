import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { config } from "./config/index.js";
import { logger } from "./shared/logger.js";
import { AppError } from "./shared/errors.js";
import { ipBanGuard, requireAuth } from "./modules/auth/auth.middleware.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { projectsRouter } from "./modules/projects/projects.routes.js";
import { clientsRouter } from "./modules/clients/clients.routes.js";
import { tasksRouter } from "./modules/tasks/tasks.routes.js";

export const app = express();

app.set("trust proxy", true);

app.use(helmet({
  contentSecurityPolicy: false // Allows inline assets for SPA
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

// Global IP Ban Enforcement
app.use(ipBanGuard);

// Logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  if (config.NODE_ENV !== "test") {
    logger.info({ method: req.method, path: req.path }, "HTTP Request");
  }
  next();
});

// Health check
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/auth", authRouter);
app.use("/api/projects", requireAuth, projectsRouter);
app.use("/api/clients", requireAuth, clientsRouter);
app.use("/api/tasks", requireAuth, tasksRouter);

// Client Static SPA Serving
const clientDist = path.join(process.cwd(), "client", "dist");
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    res.sendFile(path.join(clientDist, "index.html"));
  });
}

// Central Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || "Internal server error";

  logger.error({ err, statusCode }, "Request error");

  res.status(statusCode).json({
    error: err.name || "Error",
    message,
    statusCode
  });
});
