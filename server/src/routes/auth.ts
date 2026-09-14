import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const router = Router();
const SALT_ROUNDS = 10;

function signToken(userId: string) {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "7d" });
}

// POST /api/auth/signup — create a user and return a JWT
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({ data: { email, passwordHash } });

  res.status(201).json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
});

// POST /api/auth/login — verify credentials and return a JWT
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    // Same error for both cases so we don't leak which part was wrong.
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ token: signToken(user.id), user: { id: user.id, email: user.email } });
});

export default router;
