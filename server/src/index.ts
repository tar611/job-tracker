import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./lib/prisma";
import authRoutes from "./routes/auth";
import applicationRoutes from "./routes/applications";

const app = express();
const port = process.env.PORT ?? 4000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/applications", applicationRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", message: (err as Error).message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
