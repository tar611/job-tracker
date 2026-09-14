// Augments Express's Request with the userId set by requireAuth.
import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
