#!/usr/bin/env node

/**
 * ToolHub CLI — Proxy Runner
 *
 * NPM creates a symlink 'toolhub' → this file.
 * This script simply forwards all CLI arguments to the actual ToolHub binary
 * that was downloaded by postinstall.js into the vendor/ directory.
 *
 * Example: user types "toolhub start" → this script runs vendor/toolhub start
 */

const { spawnSync } = require("child_process");
const { join } = require("path");
const { existsSync } = require("fs");

const isWin = process.platform === "win32";
const binaryName = isWin ? "toolhub.exe" : "toolhub";
const vendorDir = join(__dirname, "..", "vendor");
const binaryPath = join(vendorDir, binaryName);

if (!existsSync(binaryPath)) {
  console.error("❌ ToolHub binary not found at:", binaryPath);
  console.error("   Try reinstalling: npm install -g toolhub-cli");
  process.exit(1);
}

// Forward all arguments to the binary
const result = spawnSync(binaryPath, process.argv.slice(2), {
  stdio: "inherit",
  env: {
    ...process.env,
    RUN_AS_SERVICE: process.env.RUN_AS_SERVICE || "",
  },
  // Set CWD to vendor/ so binary can find public/ next to it
  cwd: vendorDir,
});

process.exit(result.status ?? 1);
