import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../lib/prisma";

const DEMO_USER_ID = "demo-user-id";

vi.mock("../../lib/prisma", () => ({
  prisma: {
    application: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Login is disabled — every request acts as this fixed demo user (see middleware/auth.ts).
vi.mock("../../lib/demoUser", () => ({
  getDemoUserId: () => DEMO_USER_ID,
}));

const mockedPrisma = vi.mocked(prisma, { deep: true });

beforeEach(() => vi.clearAllMocks());

describe("GET /api/applications", () => {
  it("scopes the query to the current (demo) user", async () => {
    mockedPrisma.application.findMany.mockResolvedValue([{ id: "1", company: "Acme" }] as never);

    const res = await request(app).get("/api/applications");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedPrisma.application.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: DEMO_USER_ID } }),
    );
  });
});

describe("POST /api/applications", () => {
  it("rejects a missing company or role", async () => {
    const res = await request(app).post("/api/applications").send({ company: "Acme" });
    expect(res.status).toBe(400);
  });

  it("creates the application owned by the current user", async () => {
    mockedPrisma.application.create.mockResolvedValue({ id: "1", company: "Acme", role: "SWE" } as never);

    const res = await request(app).post("/api/applications").send({ company: "Acme", role: "SWE" });

    expect(res.status).toBe(201);
    expect(mockedPrisma.application.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: DEMO_USER_ID }) }),
    );
  });
});

describe("PUT /api/applications/:id", () => {
  it("404s when the application belongs to someone else", async () => {
    mockedPrisma.application.findUnique.mockResolvedValue({ id: "1", userId: "someone-else" } as never);

    const res = await request(app).put("/api/applications/1").send({ status: "OFFER" });
    expect(res.status).toBe(404);
  });

  it("updates an application owned by the current user", async () => {
    mockedPrisma.application.findUnique.mockResolvedValue({ id: "1", userId: DEMO_USER_ID } as never);
    mockedPrisma.application.update.mockResolvedValue({ id: "1", status: "OFFER" } as never);

    const res = await request(app).put("/api/applications/1").send({ status: "OFFER" });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/applications/:id", () => {
  it("404s when the application belongs to someone else", async () => {
    mockedPrisma.application.findUnique.mockResolvedValue({ id: "1", userId: "someone-else" } as never);

    const res = await request(app).delete("/api/applications/1");
    expect(res.status).toBe(404);
  });

  it("deletes an application owned by the current user", async () => {
    mockedPrisma.application.findUnique.mockResolvedValue({ id: "1", userId: DEMO_USER_ID } as never);
    mockedPrisma.application.delete.mockResolvedValue({} as never);

    const res = await request(app).delete("/api/applications/1");
    expect(res.status).toBe(204);
  });
});
