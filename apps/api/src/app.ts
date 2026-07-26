import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { authRoutes } from "./routes/auth.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { getRedis } from "./lib/redis.js";

export function createApp() {
  const app = new Hono();

  const origins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    "*",
    cors({
      origin: origins,
      credentials: true,
      allowHeaders: ["Content-Type"],
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    }),
  );

  app.get("/api/health", (c) => c.json({ ok: true }));

  app.route("/api/auth", authRoutes);
  app.route("/api/public", publicRoutes);
  app.route("/api/admin", adminRoutes);

  void getRedis();

  const publicDir = join(process.cwd(), "public");
  if (existsSync(publicDir)) {
    app.use("/admin/*", serveStatic({ root: publicDir }));
    app.use("/*", serveStatic({ root: publicDir }));
    app.get("*", async (c) => {
      const path = c.req.path;
      if (path.startsWith("/api")) return c.json({ error: "Not found" }, 404);
      const { readFileSync } = await import("node:fs");
      if (path.startsWith("/admin")) {
        const file = join(publicDir, "admin", "index.html");
        if (existsSync(file)) {
          return c.html(readFileSync(file, "utf8"));
        }
      }
      const index = join(publicDir, "index.html");
      if (existsSync(index)) return c.html(readFileSync(index, "utf8"));
      return c.text("Not found", 404);
    });
  }

  return app;
}
