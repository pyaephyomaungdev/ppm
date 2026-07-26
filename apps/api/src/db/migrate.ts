import "../loadEnv.js";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required");

const __dirname = dirname(fileURLToPath(import.meta.url));
const sqlFile = join(__dirname, "../../drizzle/0000_init.sql");
const sqlText = readFileSync(sqlFile, "utf8");

const client = postgres(url, { max: 1 });
await client.unsafe(sqlText);
console.log("Schema applied from 0000_init.sql");
await client.end();
