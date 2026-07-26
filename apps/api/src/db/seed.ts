import "../loadEnv.js";
import * as argon2 from "argon2";
import { count } from "drizzle-orm";
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

const [{ projN }] = await db.select({ n: count() }).from(projects);
const [{ coN }] = await db.select({ n: count() }).from(experienceCompanies);
const [{ eduN }] = await db.select({ n: count() }).from(education);
const hasContent = projN > 0 || coN > 0 || eduN > 0;

if (hasContent && !forceContent) {
  console.log("Portfolio content already exists — skip (set FORCE_SEED_CONTENT=1 to replace)");
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

await db.insert(projects).values({
  title: "Digital Clinic Management System (DCMS)",
  slug: "digital-clinic-management-system",
  summary: [
    "Dec 2025 – Mar 2026 · Associated with Spring University Myanmar",
    "",
    "Developed a comprehensive, web-based Digital Clinic Management System (DCMS) to streamline clinical workflows from patient registration to checkout. The system replaces manual processes with an integrated digital platform, supporting branch-level data isolation and role-based access control (RBAC).",
    "",
    "Key features:",
    "• Patient & Appointment Management — public self-registration and schedule-aware booking with conflict prevention.",
    "• Clinical & Billing Workflow — clinical encounters, prescription management linked to a medication catalog, and invoice-to-payment checkout.",
    "• Architecture & Security — Node.js, TypeScript, MongoDB, Redis/BullMQ jobs, audit trails, and Cloudflare Turnstile.",
    "• Infrastructure — Docker for repeatable development and production environments.",
    "",
    "Stack: React, Vite, Tailwind CSS, Node.js, TypeScript, MongoDB, Mongoose, Redis, BullMQ, Docker.",
  ].join("\n"),
  language: "TypeScript",
  featured: true,
  sortOrder: 0,
});

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
