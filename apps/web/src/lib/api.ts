const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, "") || "";

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { credentials: "include" });
  if (!res.ok) throw new Error(`${path} ${res.status}`);
  return res.json() as Promise<T>;
}

export type Profile = {
  name: string;
  handle: string;
  headline: string | null;
  avatarUrl: string | null;
  location: string | null;
  emailPublic: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  joinedLabel: string | null;
  bio: string | null;
};

export type Stat = { id: string; label: string; value: string; sortOrder: number };
export type Project = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  url: string | null;
  repoUrl: string | null;
  language: string | null;
  featured: boolean;
  sortOrder: number;
};

export type ExperienceRole = {
  id: string;
  companyId: string;
  title: string;
  employmentType: string | null;
  startDate: string;
  endDate: string | null;
  location: string | null;
  skills: string[];
  sortOrder: number;
};

export type ExperienceCompany = {
  id: string;
  name: string;
  logoUrl: string | null;
  location: string | null;
  sortOrder: number;
  roles: ExperienceRole[];
};

export type Education = {
  id: string;
  school: string;
  degree: string | null;
  field: string | null;
  startDate: string | null;
  endDate: string | null;
  url: string | null;
};

export type Honor = {
  id: string;
  title: string;
  issuer: string | null;
  date: string | null;
  description: string | null;
  url: string | null;
};

export type License = {
  id: string;
  name: string;
  issuer: string | null;
  issueDate: string | null;
  expiryDate: string | null;
  credentialId: string | null;
  url: string | null;
};

export type Portfolio = {
  profile: Profile | null;
  stats: Stat[];
  projects: Project[];
  experience: ExperienceCompany[];
  education: Education[];
  honors: Honor[];
  licenses: License[];
};

export type ContributionDay = { date: string; count: number; level: number };
export type ContributionYear = {
  year: number;
  total: number;
  days: ContributionDay[];
  source: string;
  username: string | null;
};
