import { randomBytes } from "node:crypto";
import { getRedis } from "./redis.js";

const SESSION_TTL_SEC = 60 * 60 * 24 * 14; // 14 days
const mem = new Map<string, { adminId: string; exp: number }>();

export async function createSession(adminId: string): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const r = await getRedis();
  if (r) {
    await r.set(`sess:${token}`, adminId, { EX: SESSION_TTL_SEC });
  } else {
    mem.set(token, { adminId, exp: Date.now() + SESSION_TTL_SEC * 1000 });
  }
  return token;
}

export async function getSessionAdminId(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const r = await getRedis();
  if (r) {
    return (await r.get(`sess:${token}`)) || null;
  }
  const row = mem.get(token);
  if (!row) return null;
  if (row.exp < Date.now()) {
    mem.delete(token);
    return null;
  }
  return row.adminId;
}

export async function destroySession(token: string | undefined): Promise<void> {
  if (!token) return;
  const r = await getRedis();
  if (r) await r.del(`sess:${token}`);
  else mem.delete(token);
}
