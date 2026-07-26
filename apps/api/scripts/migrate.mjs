import { config } from "dotenv";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootEnv = join(__dirname, "../../../.env");
const localEnv = join(__dirname, "../../.env");
if (existsSync(rootEnv)) config({ path: rootEnv });
else if (existsSync(localEnv)) config({ path: localEnv });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const drizzleDir = join(__dirname, "../drizzle");
const files = readdirSync(drizzleDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const client = postgres(url, { max: 1 });
try {
  for (const file of files) {
    const sqlText = readFileSync(join(drizzleDir, file), "utf8");
    await client.unsafe(sqlText);
    console.log(`Applied ${file}`);
  }
  console.log("Migrations complete");
} finally {
  await client.end();
}
