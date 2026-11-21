import { describe, it, expect } from "vitest";
import { ProjectsService } from "../../src/modules/projects/projects.service.js";

describe("ProjectsService CRUD Operations", () => {
  it("should create, get, update, and delete a project", async () => {
    // Create
    const project = await ProjectsService.createProject({
      name: "مشروع تجريبي جديد",
      code: "DEMO_TEST",
      color: "#F59E0B",
      icon: "rocket",
      description: "مشروع للاختبار السريع"
    });

    expect(project.id).toBeDefined();
    expect(project.code).toBe("DEMO_TEST");

    // Get by ID
    const fetched = await ProjectsService.getProjectById(project.id);
    expect(fetched.name).toBe("مشروع تجريبي جديد");

    // Update
    const updated = await ProjectsService.updateProject(project.id, {
      description: "تم تحديث الوصف بنجاح"
    });
    expect(updated.description).toBe("تم تحديث الوصف بنجاح");

    // Delete
    const deleted = await ProjectsService.deleteProject(project.id);
    expect(deleted.id).toBe(project.id);
  });
});
