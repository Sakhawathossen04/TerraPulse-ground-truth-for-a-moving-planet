import fs from "node:fs";
import path from "node:path";

const dir = path.join(process.cwd(), "data", "artifacts");
if (!fs.existsSync(path.join(dir, "catalog.json"))) {
  console.log("[terrapulse] artifacts missing — run `npm run pipeline`");
  process.exit(1);
}
console.log("[terrapulse] artifacts present");
