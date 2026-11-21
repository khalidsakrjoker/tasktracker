import { describe, it, expect, beforeEach } from "vitest";
import { ClientsService } from "../../src/modules/clients/clients.service.js";
import { ProjectsService } from "../../src/modules/projects/projects.service.js";
import { prisma } from "../../src/shared/db.js";

describe("ClientsService CRUD Operations", () => {
  let projectId: number;

  beforeEach(async () => {
    const projects = await ProjectsService.listProjects();
    projectId = projects[0].id;
  });

  it("should create, list, update, and delete a client", async () => {
    // Create
    const client = await ClientsService.createClient({
      name: "أ/ محمد إبراهيم - فرع الهرم",
      phone: "01012345678",
      company: "سوبرماركت التوحيد",
      notes: "عميل قديم في سيستم سجدة",
      defaultProjectId: projectId
    });

    expect(client.id).toBeDefined();
    expect(client.name).toBe("أ/ محمد إبراهيم - فرع الهرم");

    // List
    const clients = await ClientsService.listClients(projectId);
    expect(clients.some((c) => c.id === client.id)).toBe(true);

    // Update
    const updated = await ClientsService.updateClient(client.id, {
      notes: "تم التواصل لتحديث تقرير المبيعات"
    });
    expect(updated.notes).toBe("تم التواصل لتحديث تقرير المبيعات");

    // Delete
    const deleted = await ClientsService.deleteClient(client.id);
    expect(deleted.id).toBe(client.id);
  });
});
