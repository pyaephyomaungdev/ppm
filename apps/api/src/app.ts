import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "@hono/node-server/serve-static";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { authRoutes } from "./routes/auth.js";
import { publicRoutes } from "./routes/public.js";
import { adminRoutes } from "./routes/admin.js";
import { getRedis } from "./lib/redis.js";

/** apps/api/public — works whether cwd is repo root or apps/api */
function resolvePublicDir(): string | null {
  const here = dirname(fileURLToPath(import.meta.url)); // .../apps/api/dist
  const candidates = [
    join(here, "../public"),
    join(process.cwd(), "public"),
    join(process.cwd(), "apps/api/public"),
  ];
  for (const dir of candidates) {
    if (existsSync(join(dir, "index.html")) || existsSync(join(dir, "admin", "index.html"))) {
      return dir;
    }
  }
  return null;
}

export function createApp() {
  const app = new Hono();

  const origins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    "*",
    cors({
      origin: (origin) => {
        if (!origin) return origins[0] ?? "*";
        return origins.includes(origin) ? origin : origins[0] ?? origin;
      },
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

  const publicDir = resolvePublicDir();
  if (publicDir) {
    // Same Railway URL: portfolio at `/`, admin CMS at `/admin/`
    app.get("/admin", (c) => c.redirect("/admin/", 302));

    app.use(
      "/admin/*",
      serveStatic({
        root: publicDir,
        rewriteRequestPath: (path) => path, // /admin/assets/... → public/admin/assets/...
      }),
    );
    app.use("/*", serveStatic({ root: publicDir }));

    app.get("*", (c) => {
      const path = c.req.path;
      if (path.startsWith("/api")) return c.json({ error: "Not found" }, 404);

      if (path === "/admin" || path.startsWith("/admin/")) {
        const file = join(publicDir, "admin", "index.html");
        if (existsSync(file)) {
          c.header("Content-Type", "text/html; charset=utf-8");
          return c.body(readFileSync(file));
        }
      }

      const index = join(publicDir, "index.html");
      if (existsSync(index)) {
        c.header("Content-Type", "text/html; charset=utf-8");
        return c.body(readFileSync(index));
      }
      return c.text("Not found", 404);
    });
  }

  return app;
}
