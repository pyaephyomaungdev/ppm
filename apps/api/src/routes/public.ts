import { Hono } from "hono";
import { asc, eq } from "drizzle-orm";
import { db } from "../db/client.js";
import {
  education,
  experienceCompanies,
  experienceRoles,
  honors,
  licenses,
  profile,
  projects,
  stats,
} from "../db/schema.js";
import { getRedis } from "../lib/redis.js";
import { fetchGithubContributions } from "../lib/github.js";

export const publicRoutes = new Hono();

publicRoutes.get("/portfolio", async (c) => {
  const [prof] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
  const statRows = await db.select().from(stats).orderBy(asc(stats.sortOrder));
  const projectRows = await db.select().from(projects).orderBy(asc(projects.sortOrder));
  const companies = await db
    .select()
    .from(experienceCompanies)
    .orderBy(asc(experienceCompanies.sortOrder));
  const roles = await db.select().from(experienceRoles).orderBy(asc(experienceRoles.sortOrder));
  const edu = await db.select().from(education).orderBy(asc(education.sortOrder));
  const honorRows = await db.select().from(honors).orderBy(asc(honors.sortOrder));
  const licenseRows = await db.select().from(licenses).orderBy(asc(licenses.sortOrder));

  const experience = companies.map((co) => ({
    ...co,
    roles: roles.filter((r) => r.companyId === co.id),
  }));

  return c.json({
    profile: prof ?? null,
    stats: statRows,
    projects: projectRows,
    experience,
    education: edu,
    honors: honorRows,
    licenses: licenseRows,
  });
});

publicRoutes.get("/github/contributions", async (c) => {
  const yearParam = c.req.query("year");
  const year = yearParam ? Number(yearParam) : new Date().getUTCFullYear();
  if (!Number.isFinite(year) || year < 2008 || year > 2100) {
    return c.json({ error: "Invalid year" }, 400);
  }

  const username = (process.env.GITHUB_USERNAME || "").trim();
  const token = (process.env.GITHUB_TOKEN || "").trim() || undefined;
  if (!username) {
    return c.json({ year, total: 0, days: [], source: "empty", username: null });
  }

  const redis = await getRedis();
  const data = await fetchGithubContributions(year, {
    username,
    token,
    redisGet: async (key) => (redis ? redis.get(key) : null),
    redisSet: async (key, value, ttl) => {
      if (redis) await redis.set(key, value, { EX: ttl });
    },
  });

  return c.json({ ...data, username });
});
