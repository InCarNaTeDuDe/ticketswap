import "reflect-metadata";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { initDatabase } from "./server/config/database.js";
import { v1Router } from "./server/routes/v1.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "10mb" }));

const PORT = 3000;

async function startServer() {
  console.log("Initializing high-fidelity TypeORM database engine...");
  // Attempt to initialize TypeORM PostgreSQL. If credentials are missing, falls back to structural in-memory matching state.
  await initDatabase();

  // Mount versioned api router and mount backward-compatibility api router
  app.use("/api/v1", v1Router);
  app.use("/api", v1Router); // Backward compatibility fallback

  // Healthcheck endpoint
  app.get("/health", (req, res) => {
    res.json({ status: "healthy", database: "connected-or-simulated" });
  });

  // Vite Middleware & Static Serves
  if (process.env.NODE_ENV !== "production") {
    const isHmrDisabled = process.env.DISABLE_HMR === "true";
    const vite = await createViteServer({
      configFile: path.resolve(process.cwd(), "vite.config.ts"),
      server: { 
        middlewareMode: true,
        hmr: isHmrDisabled ? false : undefined,
        watch: isHmrDisabled ? null : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("FATAL ERROR during server startup:", error);
});
