// Stand-in for real auth while login is disabled (see middleware/auth.ts).
// Every request acts as this one fixed user so applications still have an owner.
import { prisma } from "./prisma";

const DEMO_EMAIL = "demo@local";
let demoUserId: string | null = null;

// Creates the demo user once on server startup (or reuses it if it already exists).
export async function ensureDemoUser() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: {},
    create: { email: DEMO_EMAIL, passwordHash: "disabled" },
  });
  demoUserId = user.id;
}

export function getDemoUserId() {
  if (!demoUserId) throw new Error("Demo user not initialized — call ensureDemoUser() on startup");
  return demoUserId;
}
