import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1).max(120),
  handle: z.string().min(1).max(64),
  headline: z.string().max(280).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().max(120).optional().nullable(),
  emailPublic: z.string().email().optional().nullable().or(z.literal("")),
  githubUrl: z.string().url().optional().nullable().or(z.literal("")),
  websiteUrl: z.string().url().optional().nullable().or(z.literal("")),
  joinedLabel: z.string().max(80).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

export const statSchema = z.object({
  label: z.string().min(1).max(64),
  value: z.string().min(1).max(64),
  sortOrder: z.number().int().default(0),
});

export const projectSchema = z.object({
  title: z.string().min(1).max(160),
  slug: z.string().min(1).max(160),
  summary: z.string().max(2000).optional().nullable(),
  body: z.string().max(20000).optional().nullable(),
  period: z.string().max(80).optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  repoUrl: z.string().url().optional().nullable().or(z.literal("")),
  language: z.string().max(64).optional().nullable(),
  techStack: z.array(z.string().max(64)).default([]),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const experienceCompanySchema = z.object({
  name: z.string().min(1).max(160),
  logoUrl: z.string().url().optional().nullable().or(z.literal("")),
  location: z.string().max(160).optional().nullable(),
  sortOrder: z.number().int().default(0),
});

export const experienceRoleSchema = z.object({
  companyId: z.string().uuid(),
  title: z.string().min(1).max(160),
  employmentType: z.string().max(80).optional().nullable(),
  startDate: z.string().min(4).max(32),
  endDate: z.string().max(32).optional().nullable(),
  location: z.string().max(160).optional().nullable(),
  skills: z.array(z.string().max(64)).default([]),
  sortOrder: z.number().int().default(0),
});

export const educationSchema = z.object({
  school: z.string().min(1).max(200),
  degree: z.string().max(200).optional().nullable(),
  field: z.string().max(200).optional().nullable(),
  startDate: z.string().max(32).optional().nullable(),
  endDate: z.string().max(32).optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const honorSchema = z.object({
  title: z.string().min(1).max(200),
  issuer: z.string().max(200).optional().nullable(),
  date: z.string().max(32).optional().nullable(),
  description: z.string().max(1000).optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const licenseSchema = z.object({
  name: z.string().min(1).max(200),
  issuer: z.string().max(200).optional().nullable(),
  issueDate: z.string().max(32).optional().nullable(),
  expiryDate: z.string().max(32).optional().nullable(),
  credentialId: z.string().max(120).optional().nullable(),
  url: z.string().url().optional().nullable().or(z.literal("")),
  sortOrder: z.number().int().default(0),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(200),
});

export type ProfileInput = z.infer<typeof profileSchema>;
export type StatInput = z.infer<typeof statSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type ExperienceCompanyInput = z.infer<typeof experienceCompanySchema>;
export type ExperienceRoleInput = z.infer<typeof experienceRoleSchema>;
export type EducationInput = z.infer<typeof educationSchema>;
export type HonorInput = z.infer<typeof honorSchema>;
export type LicenseInput = z.infer<typeof licenseSchema>;
