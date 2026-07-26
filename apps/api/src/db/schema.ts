import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const admins = pgTable("admins", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const profile = pgTable("profile", {
  id: integer("id").primaryKey().default(1),
  name: text("name").notNull().default(""),
  handle: text("handle").notNull().default(""),
  headline: text("headline"),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  emailPublic: text("email_public"),
  githubUrl: text("github_url"),
  websiteUrl: text("website_url"),
  joinedLabel: text("joined_label"),
  bio: text("bio"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const stats = pgTable("stats", {
  id: uuid("id").defaultRandom().primaryKey(),
  label: text("label").notNull(),
  value: text("value").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  summary: text("summary"),
  body: text("body"),
  period: text("period"),
  url: text("url"),
  repoUrl: text("repo_url"),
  language: text("language"),
  techStack: jsonb("tech_stack").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const experienceCompanies = pgTable("experience_companies", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  logoUrl: text("logo_url"),
  location: text("location"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const experienceRoles = pgTable("experience_roles", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => experienceCompanies.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  employmentType: text("employment_type"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  location: text("location"),
  skills: jsonb("skills").$type<string[]>().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  school: text("school").notNull(),
  degree: text("degree"),
  field: text("field"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const honors = pgTable("honors", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  issuer: text("issuer"),
  date: text("date"),
  description: text("description"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const licenses = pgTable("licenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  issuer: text("issuer"),
  issueDate: text("issue_date"),
  expiryDate: text("expiry_date"),
  credentialId: text("credential_id"),
  url: text("url"),
  sortOrder: integer("sort_order").notNull().default(0),
});
