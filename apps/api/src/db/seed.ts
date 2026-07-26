import "../loadEnv.js";
import * as argon2 from "argon2";
import { count, eq } from "drizzle-orm";
import { db } from "./client.js";
import {
  admins,
  education,
  experienceCompanies,
  experienceRoles,
  honors,
  licenses,
  profile,
  projects,
  stats,
} from "./schema.js";

const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "changeme";
const forceContent = process.env.FORCE_SEED_CONTENT === "1" || process.env.FORCE_SEED_CONTENT === "true";

type ProjectSeed = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  period: string | null;
  url: string | null;
  repoUrl: string | null;
  language: string;
  techStack: string[];
  featured: boolean;
  sortOrder: number;
};

const PROJECT_SEEDS: ProjectSeed[] = [
  {
    title: "Digital Clinic Management System (DCMS)",
    slug: "digital-clinic-management-system",
    summary:
      "Web-based clinic platform covering registration through checkout, with branch isolation and role-based access control.",
    body: [
      "Associated with Spring University Myanmar.",
      "",
      "Developed a comprehensive Digital Clinic Management System (DCMS) to streamline clinical workflows from patient registration to checkout. The system replaces manual processes with an integrated digital platform, supporting branch-level data isolation and role-based access control (RBAC).",
      "",
      "Patient & Appointment Management — public self-registration and schedule-aware appointment booking with conflict prevention.",
      "",
      "Clinical & Billing Workflow — automated clinical encounters, prescription management linked to a central medication catalog, and a streamlined invoice-to-payment checkout flow.",
      "",
      "Architecture & Security — scalable backend with Node.js, TypeScript, and MongoDB, Redis/BullMQ background jobs, comprehensive audit trails, and Cloudflare Turnstile.",
      "",
      "Infrastructure — Docker for containerized, repeatable development and production environments.",
    ].join("\n"),
    period: "Dec 2025 – Mar 2026",
    url: null,
    repoUrl: null,
    language: "TypeScript",
    techStack: [
      "React",
      "Vite",
      "Tailwind CSS",
      "Node.js",
      "TypeScript",
      "MongoDB",
      "Mongoose",
      "Redis",
      "BullMQ",
      "Docker",
    ],
    featured: true,
    sortOrder: 0,
  },
  {
    title: "ToastStar",
    slug: "toaststar",
    summary:
      "React toast library with cinematic center-launch intros, hover fan-out stacks, queue-aware delivery, and optional toast history.",
    body: [
      "toaststar is an open-source React notification library focused on motion and control — not just another snackbar wrapper.",
      "",
      "It ships a center-launch intro before settling to the edge, hover-only stack fan-out, scoped controllers so multiple apps on one page do not cross-fire, and helpers like toast.loading(), toast.update(), and toast.promise() for async flows.",
      "",
      "Optional IndexedDB or in-memory history, theme presets (glass, midnight, sunset, and more), progress bars, swipe-to-dismiss, dedupe keys, and queue overflow policies round out the API. Install with npm install toaststar.",
    ].join("\n"),
    period: null,
    url: "https://toaststar.pages.dev/",
    repoUrl: "https://github.com/pyaephyomaungdev/toaststar",
    language: "TypeScript",
    techStack: ["React", "TypeScript", "Vite", "IndexedDB"],
    featured: true,
    sortOrder: 1,
  },
  {
    title: "DeskKit",
    slug: "deskkit",
    summary:
      "Local-first browser suite for private work — PII masking, PDF tools, image redact, metadata strip, and notes. Bytes stay on device.",
    body: [
      "DeskKit is a local-first privacy suite that runs sensitive tools in the browser: SecureLens for PII masking in AI chats, PDF Pages / Stamp / Merge / Split / Compress, Image Redact, Metadata Strip, and Notes.",
      "",
      "PDF and image bytes never leave the device. Notes stay in IndexedDB unless you explicitly save them to an optional encrypted vault. Signed-in users can create Secure Share links with password-derived AES-GCM ciphertext and expiry.",
      "",
      "The stack includes a React + Vite web app, Hono API for auth and vault ciphertext, pure TypeScript PII/PDF packages, and an optional local MCP server so Cursor or Claude Desktop can call tools on your machine without sending data to the cloud.",
      "",
      "A hosted PII mask/unmask API with daily free quota is also available for agents and backends that need Zero Data Retention-style processing.",
    ].join("\n"),
    period: null,
    url: "https://deskkit.space/",
    repoUrl: "https://github.com/pyaephyomaungdev/secure-lens",
    language: "TypeScript",
    techStack: [
      "React",
      "TypeScript",
      "Vite",
      "Tailwind CSS",
      "Hono",
      "PostgreSQL",
      "Redis",
      "pdf-lib",
      "Web Crypto",
    ],
    featured: true,
    sortOrder: 2,
  },
];

async function ensureProjects() {
  for (const p of PROJECT_SEEDS) {
    const [existing] = await db.select().from(projects).where(eq(projects.slug, p.slug)).limit(1);
    if (existing) {
      if (!existing.body) {
        await db
          .update(projects)
          .set({
            summary: p.summary,
            body: p.body,
            period: p.period,
            url: p.url,
            repoUrl: p.repoUrl,
            language: p.language,
            techStack: p.techStack,
            featured: p.featured,
          })
          .where(eq(projects.id, existing.id));
        console.log(`Enriched project ${p.slug}`);
      } else {
        console.log(`Project ${p.slug} exists — skip`);
      }
      continue;
    }
    await db.insert(projects).values(p);
    console.log(`Inserted project ${p.slug}`);
  }
}

const [{ n }] = await db.select({ n: count() }).from(admins);
if (n === 0) {
  const passwordHash = await argon2.hash(password);
  await db.insert(admins).values({ email, passwordHash });
  console.log(`Created admin ${email}`);
} else {
  console.log("Admin already exists — skip");
}

const [{ pn }] = await db.select({ pn: count() }).from(profile);
if (pn === 0) {
  await db.insert(profile).values({
    id: 1,
    name: "Pyae Phyo Maung",
    handle: "pyaephyomaung",
    headline: "Full-stack engineer",
    location: "Thailand",
    emailPublic: "pyaephyomaung.dev@gmail.com",
    githubUrl: "https://github.com/pyaephyomaungdev",
    joinedLabel: "Joined recently",
    bio: "Full-stack engineer building web platforms, clinic systems, and privacy-minded tools across Thailand and remote teams.",
  });
  console.log("Seeded profile row");
}

const [{ n: projN }] = await db.select({ n: count() }).from(projects);
const [{ n: coN }] = await db.select({ n: count() }).from(experienceCompanies);
const [{ n: eduN }] = await db.select({ n: count() }).from(education);
const hasContent = projN > 0 || coN > 0 || eduN > 0;

if (hasContent && !forceContent) {
  console.log("Portfolio content already exists — ensuring featured projects only");
  await ensureProjects();
  process.exit(0);
}

if (forceContent && hasContent) {
  console.log("FORCE_SEED_CONTENT=1 — clearing portfolio tables…");
  await db.delete(experienceRoles);
  await db.delete(experienceCompanies);
  await db.delete(projects);
  await db.delete(education);
  await db.delete(honors);
  await db.delete(licenses);
  await db.delete(stats);
}

console.log("Seeding portfolio content…");

await db.insert(stats).values([
  { label: "Years building", value: "4+", sortOrder: 0 },
  { label: "Focus", value: "Full-stack", sortOrder: 1 },
  { label: "Based in", value: "Thailand", sortOrder: 2 },
  { label: "Open to", value: "Remote", sortOrder: 3 },
]);

await ensureProjects();

const [studio] = await db
  .insert(experienceCompanies)
  .values({
    name: "Studio Next Steps Pte. Ltd.",
    location: null,
    sortOrder: 0,
  })
  .returning();

const [amdon] = await db
  .insert(experienceCompanies)
  .values({
    name: "The Amdon Group",
    location: "Remote",
    sortOrder: 1,
  })
  .returning();

const [labour] = await db
  .insert(experienceCompanies)
  .values({
    name: "Ministry of Labour",
    location: null,
    sortOrder: 2,
  })
  .returning();

await db.insert(experienceRoles).values([
  {
    companyId: studio!.id,
    title: "Full Stack Engineer",
    employmentType: "Contract",
    startDate: "Jun 2023",
    endDate: null,
    location: null,
    skills: ["Software Infrastructure", "Full-Stack Development"],
    sortOrder: 0,
  },
  {
    companyId: amdon!.id,
    title: "Frontend Developer",
    employmentType: "Contract",
    startDate: "Jul 2024",
    endDate: "Jun 2026",
    location: "Bangkok City, Thailand",
    skills: ["React", "Node.js"],
    sortOrder: 0,
  },
  {
    companyId: amdon!.id,
    title: "Javascript Developer",
    employmentType: "Full-time",
    startDate: "Nov 2022",
    endDate: "Jul 2024",
    location: null,
    skills: ["Hype", "JavaScript"],
    sortOrder: 1,
  },
  {
    companyId: labour!.id,
    title: "IT Manager",
    employmentType: "Full-time",
    startDate: "Aug 2021",
    endDate: "Dec 2023",
    location: null,
    skills: ["Information Technology Infrastructure", "Technology Management"],
    sortOrder: 0,
  },
]);

await db.insert(education).values([
  {
    school: "Spring University Myanmar",
    degree: "Higher Diploma in Computer Science",
    field: "Computer Science",
    startDate: "Jun 2025",
    endDate: "Apr 2026",
    sortOrder: 0,
  },
  {
    school: "Spring University Myanmar",
    degree: "Diploma in Computer Science",
    field: "Computer Science",
    startDate: "Aug 2024",
    endDate: "Aug 2025",
    sortOrder: 1,
  },
  {
    school: "University of the People",
    degree: "Associate Degree In Computer Science",
    field: "Computer Science",
    startDate: "Aug 2025",
    endDate: "Present",
    sortOrder: 2,
  },
]);

await db.insert(honors).values([
  {
    title: "Best Documentation & Reporting Award",
    issuer:
      "Spring University Myanmar - School of Science, Technology, Engineering, and Mathematics (STEM)",
    date: "May 2026",
    description:
      "Awarded for demonstrating excellence in technical documentation and reporting within the Higher Diploma in Computer Science program at Spring University Myanmar. This recognition highlights the ability to produce detailed, professional-standard technical reports, effectively document complex project processes, and communicate technical insights clearly and accurately, ensuring that project outcomes align with industry standards.",
    sortOrder: 0,
  },
  {
    title: "Best Project Award",
    issuer:
      "Spring University Myanmar - School of Science, Technology, Engineering, and Mathematics (STEM)",
    date: "May 2026",
    description:
      "Awarded for the outstanding Capstone Project, 'Digital Clinic Management System (DCMS),' developed as part of the Higher Diploma in Computer Science program. Collaborated within Team Brainiacs to design and implement a comprehensive, web-based clinic management solution using a modern stack (Node.js, TypeScript, React, MongoDB). The project demonstrated technical proficiency in building a scalable architecture with features including role-based access control, appointment scheduling with conflict prevention, clinical encounter workflows, and automated billing, all while adhering to professional software engineering and project management standards.",
    sortOrder: 1,
  },
]);

await db.insert(licenses).values([
  {
    name: "Diploma in Professional Computing",
    issuer: "OnSkyGlobal",
    issueDate: "Dec 2021",
    expiryDate: null,
    credentialId: "OSG13JP1E5",
    sortOrder: 0,
  },
  {
    name: "Software Engineering",
    issuer: "KMD Educational Institute",
    issueDate: "Sep 2018",
    expiryDate: null,
    credentialId: null,
    sortOrder: 1,
  },
  {
    name: "Introduction to Cybersecurity",
    issuer: "Cisco Networking Academy",
    issueDate: "Aug 2020",
    expiryDate: null,
    credentialId: null,
    sortOrder: 2,
  },
  {
    name: "Advanced Google Analytics",
    issuer: "Google",
    issueDate: "Aug 2020",
    expiryDate: "Aug 2023",
    credentialId: null,
    sortOrder: 3,
  },
  {
    name: "The Fundamentals of Digital Marketing",
    issuer: "Google Digital Garage",
    issueDate: "Aug 2020",
    expiryDate: null,
    credentialId: "8QW C4J Z2B",
    sortOrder: 4,
  },
]);

console.log("Portfolio seed complete");
process.exit(0);
