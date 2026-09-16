import "dotenv/config";
import { app } from "./app";
import { ensureDemoUser } from "./lib/demoUser";

const port = process.env.PORT ?? 4000;

ensureDemoUser()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    // Without this, a bad DATABASE_URL (or any DB connection failure) crashed
    // the process on an unhandled rejection with no clear message in the logs.
    console.error("Failed to start server — could not initialize demo user:", err);
    process.exit(1);
  });
