import { Hono } from "hono";
import { setCookie, deleteCookie, getCookie } from "hono/cookie";
import * as argon2 from "argon2";
import { eq } from "drizzle-orm";
import { loginSchema } from "@ppm/shared";
import { db } from "../db/client.js";
import { admins } from "../db/schema.js";
import { createSession, destroySession } from "../lib/session.js";
import { COOKIE, requireAdmin, type AdminVars } from "../middleware/auth.js";

export const authRoutes = new Hono<{ Variables: AdminVars }>();

function cookieSecure() {
  return process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
}

authRoutes.post("/login", async (c) => {
  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: "Invalid JSON" }, 400);
  }
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);

  const email = parsed.data.email.trim().toLowerCase();
  const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
  if (!admin) return c.json({ error: "Invalid credentials" }, 401);

  const ok = await argon2.verify(admin.passwordHash, parsed.data.password);
  if (!ok) return c.json({ error: "Invalid credentials" }, 401);

  const token = await createSession(admin.id);
  setCookie(c, COOKIE, token, {
    httpOnly: true,
    sameSite: "Lax",
    secure: cookieSecure(),
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
  return c.json({ email: admin.email });
});

authRoutes.post("/logout", async (c) => {
  const token = getCookie(c, COOKIE);
  await destroySession(token);
  deleteCookie(c, COOKIE, { path: "/" });
  return c.json({ ok: true });
});

authRoutes.get("/me", requireAdmin(), async (c) => {
  return c.json({ email: c.get("adminEmail"), id: c.get("adminId") });
});
