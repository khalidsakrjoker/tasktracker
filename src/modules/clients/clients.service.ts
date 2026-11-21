import { prisma } from "../../shared/db.js";
import { NotFoundError } from "../../shared/errors.js";

export interface CreateClientInput {
  name: string;
  phone?: string;
  company?: string;
  notes?: string;
  defaultProjectId?: number;
}

export interface UpdateClientInput {
  name?: string;
  phone?: string;
  company?: string;
  notes?: string;
  defaultProjectId?: number;
}

export class ClientsService {
  static async listClients(projectId?: number) {
    return prisma.client.findMany({
      where: projectId ? { defaultProjectId: projectId } : undefined,
      orderBy: { name: "asc" },
      include: {
        defaultProject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true
          }
        },
        _count: {
          select: {
            tasks: true
          }
        }
      }
    });
  }

  static async createClient(data: CreateClientInput) {
    return prisma.client.create({
      data: {
        name: data.name.trim(),
        phone: data.phone?.trim(),
        company: data.company?.trim(),
        notes: data.notes?.trim(),
        defaultProjectId: data.defaultProjectId
      },
      include: {
        defaultProject: true
      }
    });
  }

  static async updateClient(id: number, data: UpdateClientInput) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Client with id ${id} not found`);
    }

    return prisma.client.update({
      where: { id },
      data,
      include: {
        defaultProject: true
      }
    });
  }

  static async deleteClient(id: number) {
    const existing = await prisma.client.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError(`Client with id ${id} not found`);
    }

    return prisma.client.delete({ where: { id } });
  }
}
