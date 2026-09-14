import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { getDemoUserId } from "../lib/demoUser";

// TEMPORARY: login is disabled, so every request acts as the demo user.
// Swap this back for requireAuth (below) in routes/applications.ts to re-enable login.
export function useDemoUser(req: Request, _res: Response, next: NextFunction) {
  req.userId = getDemoUserId();
  next();
}

// Verifies the Bearer JWT and attaches the userId to the request.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "Missing auth token" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}
