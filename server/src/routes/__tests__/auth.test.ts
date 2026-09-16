import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import bcrypt from "bcrypt";
import { app } from "../../app";
import { prisma } from "../../lib/prisma";

// Mocks the database layer entirely — these tests check the route logic
// (validation, status codes, password checking), not Prisma or Postgres.
vi.mock("../../lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockedPrisma = vi.mocked(prisma, { deep: true });

describe("POST /api/auth/signup", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects a missing email or password", async () => {
    const res = await request(app).post("/api/auth/signup").send({ email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("rejects an email that's already registered", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: "1", email: "a@b.com" } as never);
    const res = await request(app).post("/api/auth/signup").send({ email: "a@b.com", password: "pw123456" });
    expect(res.status).toBe(409);
  });

  it("creates a new user and returns a token", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    mockedPrisma.user.create.mockResolvedValue({ id: "1", email: "a@b.com" } as never);

    const res = await request(app).post("/api/auth/signup").send({ email: "a@b.com", password: "pw123456" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user).toEqual({ id: "1", email: "a@b.com" });
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects an email that doesn't exist", async () => {
    mockedPrisma.user.findUnique.mockResolvedValue(null);
    const res = await request(app).post("/api/auth/login").send({ email: "nobody@x.com", password: "pw" });
    expect(res.status).toBe(401);
  });

  it("rejects the wrong password", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockedPrisma.user.findUnique.mockResolvedValue({ id: "1", email: "a@b.com", passwordHash } as never);

    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "wrong-password" });
    expect(res.status).toBe(401);
  });

  it("logs in and returns a token for correct credentials", async () => {
    const passwordHash = await bcrypt.hash("correct-password", 10);
    mockedPrisma.user.findUnique.mockResolvedValue({ id: "1", email: "a@b.com", passwordHash } as never);

    const res = await request(app).post("/api/auth/login").send({ email: "a@b.com", password: "correct-password" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });
});
