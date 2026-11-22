import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { TasksService } from "./tasks.service.js";

export const tasksRouter = Router();

tasksRouter.get("/focus", async (_req: Request, res: Response, next) => {
  try {
    const focusData = await TasksService.getTodayFocus();
    res.json(focusData);
  } catch (err) {
    next(err);
  }
});

tasksRouter.get("/", async (req: Request, res: Response, next) => {
  try {
    const filters = {
      projectId: req.query.projectId ? parseInt(String(req.query.projectId), 10) : undefined,
      clientId: req.query.clientId ? parseInt(String(req.query.clientId), 10) : undefined,
      status: req.query.status as string | undefined,
      priority: req.query.priority as string | undefined,
      search: req.query.search as string | undefined
    };
    const tasks = await TasksService.listTasks(filters);
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

tasksRouter.post("/upload-image", async (req: Request, res: Response, next) => {
  try {
    const { image } = req.body;
    if (!image || typeof image !== "string") {
      res.status(400).json({ error: "Missing image data" });
      return;
    }

    const matches = image.match(/^data:image\/(webp|jpeg|png);base64,(.+)$/);
    if (!matches) {
      res.status(400).json({ error: "Only WebP, PNG, and JPEG images are allowed" });
      return;
    }

    const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
    const buffer = Buffer.from(matches[2], "base64");

    // Security check: limit size to 3MB
    if (buffer.length > 3 * 1024 * 1024) {
      res.status(400).json({ error: "Image file exceeds 3MB limit" });
      return;
    }

    // Security check: Magic Bytes validation to prevent forged scripts/SVGs
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isJpg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isWebp = buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP";

    if (!isPng && !isJpg && !isWebp) {
      res.status(400).json({ error: "Invalid or forged image content" });
      return;
    }

    const uploadDir = path.resolve(process.cwd(), "uploads", "tasks");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `task_${Date.now()}_${crypto.randomBytes(6).toString("hex")}.${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, buffer);
    res.json({ url: `/uploads/tasks/${filename}` });
  } catch (err) {
    next(err);
  }
});

tasksRouter.put("/reorder", async (req: Request, res: Response, next) => {
  try {
    const { items } = req.body;
    if (Array.isArray(items)) {
      await TasksService.reorderTasks(items);
    }
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

tasksRouter.post("/", async (req: Request, res: Response, next) => {
  try {
    const task = await TasksService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.put("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const task = await TasksService.updateTask(id, req.body);
    res.json(task);
  } catch (err) {
    next(err);
  }
});

tasksRouter.delete("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await TasksService.deleteTask(id);
    res.json({ success: true, message: "Task deleted" });
  } catch (err) {
    next(err);
  }
});
