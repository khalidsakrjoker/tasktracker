import { prisma } from "../../shared/db.js";
import { NotFoundError } from "../../shared/errors.js";

export interface CreateTaskInput {
  title: string;
  details?: string;
  type?: "bug" | "feature" | "tweak" | "support";
  priority?: "P1" | "P2" | "P3";
  status?: "backlog" | "today" | "in_progress" | "done";
  estimatedMinutes?: number;
  dueDate?: Date;
  projectId: number;
  clientId?: number;
}

export interface UpdateTaskInput {
  title?: string;
  details?: string;
  type?: string;
  priority?: string;
  status?: string;
  estimatedMinutes?: number;
  dueDate?: Date | null;
  projectId?: number;
  clientId?: number | null;
}

export class TasksService {
  static async getTodayFocus() {
    const tasks = await prisma.task.findMany({
      where: {
        status: { in: ["today", "in_progress", "backlog"] }
      },
      include: {
        project: {
          select: { id: true, name: true, code: true, color: true, icon: true }
        },
        client: {
          select: { id: true, name: true, phone: true }
        }
      },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }]
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
      stats: {
        urgentCount: p1Urgent.length,
        todayCount: tasks.length,
        completedTodayCount: completedToday
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
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }]
    });
  }

  static async createTask(data: CreateTaskInput) {
    return prisma.task.create({
      data: {
        title: data.title.trim(),
        details: data.details?.trim(),
        type: data.type || "feature",
        priority: data.priority || "P2",
        status: data.status || "backlog",
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

    return prisma.task.update({
      where: { id },
      data: {
        ...data,
        completedAt: isMarkingDone ? new Date() : data.status && data.status !== "done" ? null : undefined
      },
      include: {
        project: true,
        client: true
      }
    });
  }

  static async deleteTask(id: number) {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Task with id ${id} not found`);
    }

    return prisma.task.delete({ where: { id } });
  }
}
