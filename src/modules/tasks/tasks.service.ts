import fs from "fs";
import path from "path";
import { prisma } from "../../shared/db.js";
import { NotFoundError } from "../../shared/errors.js";
import { logger } from "../../shared/logger.js";

export interface CreateTaskInput {
  title: string;
  details?: string;
  imageUrl?: string | null;
  type?: "bug" | "feature" | "tweak" | "support";
  priority?: "P1" | "P2" | "P3";
  status?: "backlog" | "today" | "in_progress" | "done";
  sortOrder?: number;
  estimatedMinutes?: number;
  dueDate?: Date;
  projectId: number;
  clientId?: number;
}

export interface UpdateTaskInput {
  title?: string;
  details?: string;
  imageUrl?: string | null;
  type?: string;
  priority?: string;
  status?: string;
  sortOrder?: number;
  estimatedMinutes?: number;
  dueDate?: Date | null;
  projectId?: number;
  clientId?: number | null;
}

export function deleteUploadedImage(imageUrl?: string | null): void {
  if (!imageUrl || !imageUrl.startsWith("/uploads/tasks/")) return;
  try {
    const filename = path.basename(imageUrl);
    const filePath = path.resolve(process.cwd(), "uploads", "tasks", filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info({ filePath }, "Deleted task image from disk to conserve server storage");
    }
  } catch (err) {
    logger.warn({ err, imageUrl }, "Failed to delete task image file");
  }
}

export class TasksService {
  static async getTodayFocus() {
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: ["today", "in_progress"] }
      },
      include: {
        project: {
          select: { id: true, name: true, code: true, color: true, icon: true }
        },
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: [{ priority: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });

    const backlogTasks = await prisma.task.findMany({
      where: {
        status: "backlog"
      },
      include: {
        project: {
          select: { id: true, name: true, code: true, color: true, icon: true }
        },
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: [{ priority: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });

    const p1Urgent = tasks.filter((t) => t.priority === "P1");
    const p2Features = tasks.filter((t) => t.priority === "P2");
    const p3Tweaks = tasks.filter((t) => t.priority === "P3");

    const completedToday = await prisma.task.count({
      where: {
        status: "done",
        completedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      }
    });

    return {
      p1Urgent,
      p2Features,
      p3Tweaks,
      backlogTasks,
      stats: {
        urgentCount: p1Urgent.length,
        todayCount: tasks.length,
        completedTodayCount: completedToday,
        backlogCount: backlogTasks.length
      }
    };
  }

  static async listTasks(filters: {
    projectId?: number;
    clientId?: number;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    return prisma.task.findMany({
      where: {
        projectId: filters.projectId,
        clientId: filters.clientId,
        status: filters.status,
        priority: filters.priority,
        OR: filters.search
          ? [
              { title: { contains: filters.search } },
              { details: { contains: filters.search } }
            ]
          : undefined
      },
      include: {
        project: {
          select: { id: true, name: true, code: true, color: true, icon: true }
        },
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: [{ priority: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }]
    });
  }

  static async createTask(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title.trim(),
        details: data.details?.trim(),
        imageUrl: data.imageUrl,
        type: data.type || "feature",
        priority: data.priority || "P2",
        status: data.status || "backlog",
        sortOrder: data.sortOrder || 0,
        estimatedMinutes: data.estimatedMinutes || 30,
        dueDate: data.dueDate,
        projectId: data.projectId,
        clientId: data.clientId
      },
      include: {
        project: true,
        client: true
      }
    });
  }

  static async updateTask(id: number, data: UpdateTaskInput) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    const isMarkingDone = data.status === "done" && existing.status !== "done";

    // Auto-delete image file when task is completed to save server storage
    let updatedImageUrl = data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl;
    if (isMarkingDone && existing.imageUrl) {
      deleteUploadedImage(existing.imageUrl);
      updatedImageUrl = null;
    }

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        imageUrl: updatedImageUrl,
        completedAt: isMarkingDone ? new Date() : data.status && data.status !== "done" ? null : undefined
      },
      include: {
        project: true,
        client: true
      }
    });
  }

  static async reorderTasks(items: Array<{ id: number; sortOrder: number }>) {
    const updates = items.map((item) =>
      prisma.task.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    );
    return prisma.$transaction(updates);
  }

  static async deleteTask(id: number) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    // Auto-delete image file if task is deleted
    if (existing.imageUrl) {
      deleteUploadedImage(existing.imageUrl);
    }

    return prisma.task.delete({ where: { id } });
  }
}
