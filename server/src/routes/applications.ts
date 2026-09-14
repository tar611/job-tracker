import { Router } from "express";
import { prisma } from "../lib/prisma";
import { useDemoUser } from "../middleware/auth";

const router = Router();
router.use(useDemoUser); // login disabled — see middleware/auth.ts

// GET /api/applications — list the current user's applications, newest first
router.get("/", async (req, res) => {
  const applications = await prisma.application.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(applications);
});

// POST /api/applications — create a new application for the current user
router.post("/", async (req, res) => {
  const { company, role, status, notes, appliedDate } = req.body;
  if (!company || !role) {
    return res.status(400).json({ error: "Company and role are required" });
  }

  const application = await prisma.application.create({
    data: {
      company,
      role,
      status,
      notes,
      appliedDate: appliedDate ? new Date(appliedDate) : undefined,
      userId: req.userId!,
    },
  });
  res.status(201).json(application);
});

// Shared ownership check: only the owner can read/write past this point.
async function findOwned(id: string, userId: string) {
  const application = await prisma.application.findUnique({ where: { id } });
  return application && application.userId === userId ? application : null;
}

// PUT /api/applications/:id — update a field (e.g. status) on an owned application
router.put("/:id", async (req, res) => {
  const existing = await findOwned(req.params.id, req.userId!);
  if (!existing) {
    return res.status(404).json({ error: "Application not found" });
  }

  const { company, role, status, notes, appliedDate } = req.body;
  const application = await prisma.application.update({
    where: { id: req.params.id },
    data: { company, role, status, notes, appliedDate: appliedDate ? new Date(appliedDate) : undefined },
  });
  res.json(application);
});

// DELETE /api/applications/:id — remove an owned application
router.delete("/:id", async (req, res) => {
  const existing = await findOwned(req.params.id, req.userId!);
  if (!existing) {
    return res.status(404).json({ error: "Application not found" });
  }

  await prisma.application.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
