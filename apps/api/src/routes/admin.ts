import { Hono } from "hono";
import { asc, eq, max } from "drizzle-orm";
import {
  educationSchema,
  experienceCompanySchema,
  experienceRoleSchema,
  honorSchema,
  licenseSchema,
  profileSchema,
  projectSchema,
  statSchema,
} from "@ppm/shared";
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
import { requireAdmin, type AdminVars } from "../middleware/auth.js";

export const adminRoutes = new Hono<{ Variables: AdminVars }>();
adminRoutes.use("*", requireAdmin());

function emptyToNull(v: string | null | undefined) {
  if (v == null || v === "") return null;
  return v;
}

/** If client sends 0 / unset, append after current max so new rows are not forced to the top. */
async function resolveSortOrder(
  fetchMax: () => Promise<number | null>,
  requested: number | undefined,
): Promise<number> {
  if (requested != null && requested !== 0) return requested;
  const m = await fetchMax();
  return (m ?? -1) + 1;
}

// —— Profile ——
adminRoutes.get("/profile", async (c) => {
  const [row] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
  return c.json(row ?? null);
});

adminRoutes.put("/profile", async (c) => {
  const body = await c.req.json();
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) return c.json({ error: "Invalid body", details: parsed.error.flatten() }, 400);
  const d = parsed.data;
  await db
    .insert(profile)
    .values({
      id: 1,
      name: d.name,
      handle: d.handle,
      headline: emptyToNull(d.headline),
      avatarUrl: emptyToNull(d.avatarUrl),
      location: emptyToNull(d.location),
      emailPublic: emptyToNull(d.emailPublic),
      githubUrl: emptyToNull(d.githubUrl),
      websiteUrl: emptyToNull(d.websiteUrl),
      joinedLabel: emptyToNull(d.joinedLabel),
      bio: emptyToNull(d.bio),
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: profile.id,
      set: {
        name: d.name,
        handle: d.handle,
        headline: emptyToNull(d.headline),
        avatarUrl: emptyToNull(d.avatarUrl),
        location: emptyToNull(d.location),
        emailPublic: emptyToNull(d.emailPublic),
        githubUrl: emptyToNull(d.githubUrl),
        websiteUrl: emptyToNull(d.websiteUrl),
        joinedLabel: emptyToNull(d.joinedLabel),
        bio: emptyToNull(d.bio),
        updatedAt: new Date(),
      },
    });
  const [row] = await db.select().from(profile).where(eq(profile.id, 1)).limit(1);
  return c.json(row);
});

// —— Stats ——
adminRoutes.get("/stats", async (c) => {
  return c.json(await db.select().from(stats).orderBy(asc(stats.createdAt)));
});

adminRoutes.post("/stats", async (c) => {
  const parsed = statSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(stats.sortOrder) }).from(stats);
    return row?.m ?? null;
  }, parsed.data.sortOrder);
  const [row] = await db.insert(stats).values({ ...parsed.data, sortOrder }).returning();
  return c.json(row, 201);
});

adminRoutes.put("/stats/:id", async (c) => {
  const parsed = statSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const [row] = await db
    .update(stats)
    .set(parsed.data)
    .where(eq(stats.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/stats/:id", async (c) => {
  await db.delete(stats).where(eq(stats.id, c.req.param("id")));
  return c.json({ ok: true });
});

// —— Projects ——
adminRoutes.get("/projects", async (c) => {
  return c.json(await db.select().from(projects).orderBy(asc(projects.createdAt)));
});

adminRoutes.post("/projects", async (c) => {
  const parsed = projectSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(projects.sortOrder) }).from(projects);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(projects)
    .values({
      title: d.title,
      slug: d.slug,
      summary: emptyToNull(d.summary),
      body: emptyToNull(d.body),
      period: emptyToNull(d.period),
      url: emptyToNull(d.url),
      repoUrl: emptyToNull(d.repoUrl),
      language: emptyToNull(d.language),
      techStack: d.techStack ?? [],
      featured: d.featured,
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/projects/:id", async (c) => {
  const parsed = projectSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(projects)
    .set({
      title: d.title,
      slug: d.slug,
      summary: emptyToNull(d.summary),
      body: emptyToNull(d.body),
      period: emptyToNull(d.period),
      url: emptyToNull(d.url),
      repoUrl: emptyToNull(d.repoUrl),
      language: emptyToNull(d.language),
      techStack: d.techStack ?? [],
      featured: d.featured,
      sortOrder: d.sortOrder,
    })
    .where(eq(projects.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/projects/:id", async (c) => {
  await db.delete(projects).where(eq(projects.id, c.req.param("id")));
  return c.json({ ok: true });
});

// —— Experience companies + roles ——
adminRoutes.get("/experience", async (c) => {
  const companies = await db
    .select()
    .from(experienceCompanies)
    .orderBy(asc(experienceCompanies.sortOrder));
  const roles = await db.select().from(experienceRoles).orderBy(asc(experienceRoles.sortOrder));
  return c.json(
    companies.map((co) => ({
      ...co,
      roles: roles.filter((r) => r.companyId === co.id),
    })),
  );
});

adminRoutes.post("/experience/companies", async (c) => {
  const parsed = experienceCompanySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(experienceCompanies.sortOrder) }).from(experienceCompanies);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(experienceCompanies)
    .values({
      name: d.name,
      logoUrl: emptyToNull(d.logoUrl),
      location: emptyToNull(d.location),
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/experience/companies/:id", async (c) => {
  const parsed = experienceCompanySchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(experienceCompanies)
    .set({
      name: d.name,
      logoUrl: emptyToNull(d.logoUrl),
      location: emptyToNull(d.location),
      sortOrder: d.sortOrder,
    })
    .where(eq(experienceCompanies.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/experience/companies/:id", async (c) => {
  await db.delete(experienceCompanies).where(eq(experienceCompanies.id, c.req.param("id")));
  return c.json({ ok: true });
});

adminRoutes.post("/experience/roles", async (c) => {
  const parsed = experienceRoleSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body", details: parsed.error.flatten() }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(experienceRoles.sortOrder) }).from(experienceRoles);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(experienceRoles)
    .values({
      companyId: d.companyId,
      title: d.title,
      employmentType: emptyToNull(d.employmentType),
      startDate: d.startDate,
      endDate: emptyToNull(d.endDate),
      location: emptyToNull(d.location),
      skills: d.skills,
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/experience/roles/:id", async (c) => {
  const parsed = experienceRoleSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(experienceRoles)
    .set({
      companyId: d.companyId,
      title: d.title,
      employmentType: emptyToNull(d.employmentType),
      startDate: d.startDate,
      endDate: emptyToNull(d.endDate),
      location: emptyToNull(d.location),
      skills: d.skills,
      sortOrder: d.sortOrder,
    })
    .where(eq(experienceRoles.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/experience/roles/:id", async (c) => {
  await db.delete(experienceRoles).where(eq(experienceRoles.id, c.req.param("id")));
  return c.json({ ok: true });
});

// —— Education ——
adminRoutes.get("/education", async (c) => {
  return c.json(await db.select().from(education).orderBy(asc(education.createdAt)));
});

adminRoutes.post("/education", async (c) => {
  const parsed = educationSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(education.sortOrder) }).from(education);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(education)
    .values({
      school: d.school,
      degree: emptyToNull(d.degree),
      field: emptyToNull(d.field),
      startDate: emptyToNull(d.startDate),
      endDate: emptyToNull(d.endDate),
      url: emptyToNull(d.url),
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/education/:id", async (c) => {
  const parsed = educationSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(education)
    .set({
      school: d.school,
      degree: emptyToNull(d.degree),
      field: emptyToNull(d.field),
      startDate: emptyToNull(d.startDate),
      endDate: emptyToNull(d.endDate),
      url: emptyToNull(d.url),
      sortOrder: d.sortOrder,
    })
    .where(eq(education.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/education/:id", async (c) => {
  await db.delete(education).where(eq(education.id, c.req.param("id")));
  return c.json({ ok: true });
});

// —— Honors ——
adminRoutes.get("/honors", async (c) => {
  return c.json(await db.select().from(honors).orderBy(asc(honors.createdAt)));
});

adminRoutes.post("/honors", async (c) => {
  const parsed = honorSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(honors.sortOrder) }).from(honors);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(honors)
    .values({
      title: d.title,
      issuer: emptyToNull(d.issuer),
      date: emptyToNull(d.date),
      description: emptyToNull(d.description),
      url: emptyToNull(d.url),
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/honors/:id", async (c) => {
  const parsed = honorSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(honors)
    .set({
      title: d.title,
      issuer: emptyToNull(d.issuer),
      date: emptyToNull(d.date),
      description: emptyToNull(d.description),
      url: emptyToNull(d.url),
      sortOrder: d.sortOrder,
    })
    .where(eq(honors.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/honors/:id", async (c) => {
  await db.delete(honors).where(eq(honors.id, c.req.param("id")));
  return c.json({ ok: true });
});

// —— Licenses ——
adminRoutes.get("/licenses", async (c) => {
  return c.json(await db.select().from(licenses).orderBy(asc(licenses.createdAt)));
});

adminRoutes.post("/licenses", async (c) => {
  const parsed = licenseSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const sortOrder = await resolveSortOrder(async () => {
    const [row] = await db.select({ m: max(licenses.sortOrder) }).from(licenses);
    return row?.m ?? null;
  }, d.sortOrder);
  const [row] = await db
    .insert(licenses)
    .values({
      name: d.name,
      issuer: emptyToNull(d.issuer),
      issueDate: emptyToNull(d.issueDate),
      expiryDate: emptyToNull(d.expiryDate),
      credentialId: emptyToNull(d.credentialId),
      url: emptyToNull(d.url),
      sortOrder,
    })
    .returning();
  return c.json(row, 201);
});

adminRoutes.put("/licenses/:id", async (c) => {
  const parsed = licenseSchema.safeParse(await c.req.json());
  if (!parsed.success) return c.json({ error: "Invalid body" }, 400);
  const d = parsed.data;
  const [row] = await db
    .update(licenses)
    .set({
      name: d.name,
      issuer: emptyToNull(d.issuer),
      issueDate: emptyToNull(d.issueDate),
      expiryDate: emptyToNull(d.expiryDate),
      credentialId: emptyToNull(d.credentialId),
      url: emptyToNull(d.url),
      sortOrder: d.sortOrder,
    })
    .where(eq(licenses.id, c.req.param("id")))
    .returning();
  if (!row) return c.json({ error: "Not found" }, 404);
  return c.json(row);
});

adminRoutes.delete("/licenses/:id", async (c) => {
  await db.delete(licenses).where(eq(licenses.id, c.req.param("id")));
  return c.json({ ok: true });
});
