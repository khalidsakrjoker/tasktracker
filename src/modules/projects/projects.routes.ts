import { Router, Request, Response } from "express";
import { ProjectsService } from "./projects.service.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (_req: Request, res: Response, next) => {
  try {
    const projects = await ProjectsService.listProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const project = await ProjectsService.getProjectById(id);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.post("/", async (req: Request, res: Response, next) => {
  try {
    const project = await ProjectsService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.put("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const project = await ProjectsService.updateProject(id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.delete("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await ProjectsService.deleteProject(id);
    res.json({ success: true, message: "Project deleted" });
  } catch (err) {
    next(err);
  }
});
