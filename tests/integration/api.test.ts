import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import { app } from "../../src/app.js";
import { config } from "../../src/config/index.js";

describe("API Integration Endpoints Full Cycle", () => {
  let authToken: string;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ pin: config.APP_PIN });

    authToken = loginRes.body.token;
  });

  it("GET /health should return 200 ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });

  it("POST /api/auth/login should issue token with correct PIN", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ pin: config.APP_PIN });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("GET /api/auth/me and POST /api/auth/logout", async () => {
    const meRes = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`);
    expect(meRes.status).toBe(200);
    expect(meRes.body.authenticated).toBe(true);

    const logoutRes = await request(app).post("/api/auth/logout");
    expect(logoutRes.status).toBe(200);
    expect(logoutRes.body.success).toBe(true);
  });

  it("GET /api/projects should return projects list when authenticated", async () => {
    const res = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
  });

  it("POST, GET/:id, PUT, DELETE /api/projects full lifecycle", async () => {
    const createRes = await request(app)
      .post("/api/projects")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "مشروع الـ API المؤقت",
        code: "API_TEMP",
        color: "#6366F1",
        description: "اختبار الـ Routes"
      });
    expect(createRes.status).toBe(201);
    const projId = createRes.body.id;

    const getRes = await request(app)
      .get(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(getRes.status).toBe(200);
    expect(getRes.body.name).toBe("مشروع الـ API المؤقت");

    const updateRes = await request(app)
      .put(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ name: "مشروع معدل" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.name).toBe("مشروع معدل");

    const deleteRes = await request(app)
      .delete(`/api/projects/${projId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it("GET /api/tasks/focus and GET /api/tasks with search", async () => {
    const res = await request(app)
      .get("/api/tasks/focus")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.p1Urgent).toBeDefined();

    const searchRes = await request(app)
      .get("/api/tasks?search=test")
      .set("Authorization", `Bearer ${authToken}`);
    expect(searchRes.status).toBe(200);
  });

  it("POST, GET, PUT, DELETE /api/tasks full lifecycle", async () => {
    const projectsRes = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${authToken}`);
    const projectId = projectsRes.body[0].id;

    const createRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "مهمة اختبار الـ API",
        priority: "P2",
        status: "today",
        projectId
      });
    expect(createRes.status).toBe(201);
    const taskId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "done" });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("done");

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it("POST, GET, PUT, DELETE /api/clients full lifecycle", async () => {
    const createRes = await request(app)
      .post("/api/clients")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        name: "عميل تجريبي للـ API",
        phone: "01122334455"
      });
    expect(createRes.status).toBe(201);
    const clientId = createRes.body.id;

    const updateRes = await request(app)
      .put(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ notes: "ملاحظات تجريبية" });
    expect(updateRes.status).toBe(200);

    const listRes = await request(app)
      .get("/api/clients")
      .set("Authorization", `Bearer ${authToken}`);
    expect(listRes.status).toBe(200);

    const deleteRes = await request(app)
      .delete(`/api/clients/${clientId}`)
      .set("Authorization", `Bearer ${authToken}`);
    expect(deleteRes.status).toBe(200);
  });

  it("POST /api/tasks/upload-image and auto-cleanup on task completion", async () => {
    // 1. Upload a valid image
    const samplePng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const uploadRes = await request(app)
      .post("/api/tasks/upload-image")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ image: samplePng });

    expect(uploadRes.status).toBe(200);
    expect(uploadRes.body.url).toMatch(/^\/uploads\/tasks\/.+\.png$/);
    const imageUrl = uploadRes.body.url;

    // 2. Create task with image attached
    const projectsRes = await request(app)
      .get("/api/projects")
      .set("Authorization", `Bearer ${authToken}`);
    const projectId = projectsRes.body[0].id;

    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "مهمة مع صورة مرفقة",
        priority: "P2",
        projectId,
        imageUrl
      });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.id;
    expect(taskRes.body.imageUrl).toBe(imageUrl);

    // 3. Complete task -> should auto-delete image and clear imageUrl
    const doneRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "done" });
    expect(doneRes.status).toBe(200);
    expect(doneRes.body.imageUrl).toBeNull();

    // 4. Clean up task
    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`);
  });

  it("Supports multiple images per task and cleans up removed/completed images", async () => {
    const samplePng = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const up1 = await request(app).post("/api/tasks/upload-image").set("Authorization", `Bearer ${authToken}`).send({ image: samplePng });
    const up2 = await request(app).post("/api/tasks/upload-image").set("Authorization", `Bearer ${authToken}`).send({ image: samplePng });
    expect(up1.status).toBe(200);
    expect(up2.status).toBe(200);

    const projectsRes = await request(app).get("/api/projects").set("Authorization", `Bearer ${authToken}`);
    const projectId = projectsRes.body[0].id;

    // Create task with 2 images
    const multiUrls = JSON.stringify([up1.body.url, up2.body.url]);
    const taskRes = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "مهمة مع صور متعددة",
        priority: "P2",
        projectId,
        imageUrl: multiUrls
      });
    expect(taskRes.status).toBe(201);
    const taskId = taskRes.body.id;

    // Update task to remove up1 (keeping only up2)
    const singleUrl = JSON.stringify([up2.body.url]);
    const updateRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ imageUrl: singleUrl });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.imageUrl).toBe(singleUrl);

    // Complete task -> clears imageUrl and deletes up2
    const doneRes = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({ status: "done" });
    expect(doneRes.status).toBe(200);
    expect(doneRes.body.imageUrl).toBeNull();

    // Clean up
    await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${authToken}`);
  });
});
