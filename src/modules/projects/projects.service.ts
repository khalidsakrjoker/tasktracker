import { prisma } from "../../shared/db.js";
import { NotFoundError } from "../../shared/errors.js";

export interface CreateProjectInput {
  name: string;
  code: string;
  color?: string;
  icon?: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  color?: string;
  icon?: string;
  description?: string;
  status?: string;
}

export class ProjectsService {
  static async listProjects() {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: {
            tasks: true,
            clients: true
          }
        },
        tasks: {
          select: {
            id: true,
            priority: true,
            status: true
          }
        }
      }
    });

    return projects.map((p) => {
      const openTasks = p.tasks.filter((t) => t.status !== "done").length;
      const urgentTasks = p.tasks.filter((t) => t.status !== "done" && t.priority === "P1").length;
      const completedTasks = p.tasks.filter((t) => t.status === "done").length;

      return {
        id: p.id,
        name: p.name,
        code: p.code,
        color: p.color,
        icon: p.icon,
        description: p.description,
        status: p.status,
        createdAt: p.createdAt,
        totalTasks: p._count.tasks,
        totalClients: p._count.clients,
        openTasks,
        urgentTasks,
        completedTasks
      };
    });
  }

  static async getProjectById(id: number) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        clients: true,
        tasks: {
          include: {
            client: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!project) {
      throw new NotFoundError(`Project with id ${id} not found`);
    }

    return project;
  }

  static async createProject(data: CreateProjectInput) {
    return prisma.project.create({
      data: {
        name: data.name,
        code: data.code.toUpperCase().trim(),
        color: data.color || "#3B82F6",
        icon: data.icon || "folder",
        description: data.description
      }
    });
  }

  static async updateProject(id: number, data: UpdateProjectInput) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Project with id ${id} not found`);
    }

    return prisma.project.update({
      where: { id },
      data
    });
  }

  static async deleteProject(id: number) {
    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Project with id ${id} not found`);
    }

    return prisma.project.delete({ where: { id } });
  }
}
