import "../loadEnv.js";
import * as argon2 from "argon2";
import { count } from "drizzle-orm";
import { db } from "./client.js";
import { admins, profile } from "./schema.js";

const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD || "changeme";

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
    bio: "",
  });
  console.log("Seeded empty profile row");
}

process.exit(0);
