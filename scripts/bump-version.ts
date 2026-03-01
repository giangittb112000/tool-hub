import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const type = process.argv[2] || "patch";
const rootDir = join((import.meta as any).dir, "..");

const packagePaths = [
  join(rootDir, "package.json"),
  join(rootDir, "apps/server/package.json"),
  join(rootDir, "apps/client/package.json"),
  join(rootDir, "packages/shared/package.json"),
  join(rootDir, "packages/cli/package.json"),
];

function bump(version: string, type: string) {
  // Nếu tham số là một chuỗi version cụ thể (VD: 1.0.0)
  if (type.match(/^\d+\.\d+\.\d+$/)) return type;

  const parts = version.split(".").map(Number);
  if (type === "major") parts[0]++;
  else if (type === "minor") parts[1]++;
  else parts[2]++;

  if (type === "major") parts[1] = 0;
  if (type === "major" || type === "minor") parts[2] = 0;

  return parts.join(".");
}

// 1. Get current version from root
const rootPkg = JSON.parse(readFileSync(packagePaths[0], "utf-8"));
const oldVersion = rootPkg.version;
const newVersion = bump(oldVersion, type);

console.log(`🚀 Bumping version: ${oldVersion} -> ${newVersion} (${type})`);

// 2. Update all package.json files
for (const path of packagePaths) {
  try {
    const content = JSON.parse(readFileSync(path, "utf-8"));
    content.version = newVersion;
    writeFileSync(path, JSON.stringify(content, null, 2) + "\n");
    console.log(`✅ Updated ${path}`);
  } catch (e) {
    console.error(`❌ Failed to update ${path}`);
  }
}

console.log("\nDone! Don't forget to commit and run scripts/release.sh");
