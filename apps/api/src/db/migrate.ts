import "../loadEnv.js";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const __dirname = dirname(fileURLToPath(import.meta.url));
const drizzleDir = join(__dirname, "../../drizzle");
const files = readdirSync(drizzleDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = postgres(url, { max: 1 });
for (const file of files) {
  const sqlText = readFileSync(join(drizzleDir, file), "utf8");
  await client.unsafe(sqlText);
  console.log(`Applied ${file}`);
}
await client.end();
