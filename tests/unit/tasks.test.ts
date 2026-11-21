import { describe, it, expect } from "vitest";
import { ProjectsService } from "../../src/modules/projects/projects.service.js";
import { TasksService } from "../../src/modules/tasks/tasks.service.js";

describe("Projects & Tasks Services", () => {
  it("should list initial seeded projects", async () => {
    const projects = await ProjectsService.listProjects();
    expect(projects.length).toBeGreaterThanOrEqual(3);

    const codes = projects.map((p) => p.code);
    expect(codes).toContain("CASHX");
    expect(codes).toContain("SAJDA");
    expect(codes).toContain("WEDDING");
  });

  it("should create, update, and fetch focus tasks", async () => {
    const projects = await ProjectsService.listProjects();
    const sajda = projects.find((p) => p.code === "SAJDA")!;

    // Create task
    const task = await TasksService.createTask({
      title: "إصلاح مشكلة إجمالي الفاتورة",
      details: "الضريبة لا تحتسب على الصنف المعفى",
      type: "bug",
      priority: "P1",
      status: "today",
      projectId: sajda.id
    });

    expect(task.id).toBeDefined();
    expect(task.priority).toBe("P1");
    expect(task.status).toBe("today");

    // Fetch today focus
    const focus = await TasksService.getTodayFocus();
    expect(focus.stats.urgentCount).toBeGreaterThanOrEqual(1);

    // Update status to done
    const updated = await TasksService.updateTask(task.id, { status: "done" });
    expect(updated.status).toBe("done");
    expect(updated.completedAt).toBeDefined();

    // Clean up
    await TasksService.deleteTask(task.id);
  });
});
