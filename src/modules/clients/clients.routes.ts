import { Router, Request, Response } from "express";
import { ClientsService } from "./clients.service.js";

export const clientsRouter = Router();

clientsRouter.get("/", async (req: Request, res: Response, next) => {
  try {
    const projectId = req.query.projectId ? parseInt(String(req.query.projectId), 10) : undefined;
    const clients = await ClientsService.listClients(projectId);
    res.json(clients);
  } catch (err) {
    next(err);
  }
});

clientsRouter.post("/", async (req: Request, res: Response, next) => {
  try {
    const client = await ClientsService.createClient(req.body);
    res.status(201).json(client);
  } catch (err) {
    next(err);
  }
});

clientsRouter.put("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    const client = await ClientsService.updateClient(id, req.body);
    res.json(client);
  } catch (err) {
    next(err);
  }
});

clientsRouter.delete("/:id", async (req: Request, res: Response, next) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    await ClientsService.deleteClient(id);
    res.json({ success: true, message: "Client deleted" });
  } catch (err) {
    next(err);
  }
});
