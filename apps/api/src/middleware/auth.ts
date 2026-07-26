import type { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { eq } from "drizzle-orm";
import { db } from "../db/client.js";
import { admins } from "../db/schema.js";
import { getSessionAdminId } from "../lib/session.js";

export const COOKIE = "ppm_session";

export type AdminVars = { adminId: string; adminEmail: string };

export function requireAdmin(): MiddlewareHandler<{ Variables: AdminVars }> {
  return async (c, next) => {
    const token = getCookie(c, COOKIE);
    const adminId = await getSessionAdminId(token);
    if (!adminId) return c.json({ error: "Unauthorized" }, 401);
    const [admin] = await db.select().from(admins).where(eq(admins.id, adminId)).limit(1);
    if (!admin) return c.json({ error: "Unauthorized" }, 401);
    c.set("adminId", admin.id);
    c.set("adminEmail", admin.email);
    await next();
  };
}
