import { Router, Request, Response } from "express";
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
