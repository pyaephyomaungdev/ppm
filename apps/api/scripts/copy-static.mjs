import { cpSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(apiRoot, "public");
mkdirSync(publicDir, { recursive: true });

const webDist = join(apiRoot, "../web/dist");
const adminDist = join(apiRoot, "../admin/dist");

if (existsSync(webDist)) {
  cpSync(webDist, publicDir, { recursive: true });
  console.log("Copied web dist → api/public");
}
if (existsSync(adminDist)) {
  mkdirSync(join(publicDir, "admin"), { recursive: true });
  cpSync(adminDist, join(publicDir, "admin"), { recursive: true });
  console.log("Copied admin dist → api/public/admin");
}
