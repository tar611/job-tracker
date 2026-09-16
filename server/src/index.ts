import "dotenv/config";
import { app } from "./app";
import { ensureDemoUser } from "./lib/demoUser";

const port = process.env.PORT ?? 4000;

ensureDemoUser().then(() => {
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
