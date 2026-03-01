import { Hono } from "hono";
import { cors } from "hono/cors";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { registry } from "./core/registry";
import { testModule } from "./modules/test/module";
import { systemMonitorModule } from "./modules/system-monitor/module";
import { systemModule } from "./modules/system/module";
import { jsonFormatterModule } from "./modules/json-formatter/module";

// @ts-ignore
import pkg from "../../../package.json";

const execAsync = promisify(exec);
const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const VERSION = pkg.version;

// ─── CLI Mode ───────────────────────────────────────────────
const args = process.argv.slice(2);
const command = args[0];

const showHelp = () => {
  console.log(`
🚀 ToolHub CLI v${VERSION}
Usage: toolhub [command]

Commands:
  start     Start the background service
  stop      Stop the background service
  status    Check service status
  update    Update ToolHub to the latest version
  --help    Show this help
  -v        Show version
  `);
  process.exit(0);
};

const cliCommands: Record<string, () => Promise<void>> = {
  start: async () => {
    console.log("🚀 Starting ToolHub Service...");
    const plist = `${process.env.HOME}/Library/LaunchAgents/dev.toolhub.daemon.plist`;
    try {
      await execAsync(`launchctl load ${plist}`);
      console.log(
        `✅ ToolHub Service started. Access at http://localhost:${port}`,
      );
    } catch {
      console.error("❌ Failed to start. Is it already running?");
    }
  },
  stop: async () => {
    console.log("🛑 Stopping ToolHub Service...");
    const plist = `${process.env.HOME}/Library/LaunchAgents/dev.toolhub.daemon.plist`;
    try {
      await execAsync(`launchctl unload ${plist}`);
      console.log("✅ ToolHub Service stopped.");
    } catch {
      console.error("❌ Failed to stop. Is it already stopped?");
    }
  },
  status: async () => {
    try {
      const { stdout } = await execAsync(
        "launchctl list | grep dev.toolhub.daemon",
      );
      if (stdout.trim()) console.log("🟢 ToolHub Service is RUNNING");
      else console.log("🔴 ToolHub Service is STOPPED");
    } catch {
      console.log("🔴 ToolHub Service is STOPPED");
    }
  },
  update: async () => {
    console.log("🚀 To update ToolHub, run:");
    console.log("");
    console.log("   npm update -g @giangnt112000/toolhub-cli");
    console.log("");
  },
};

// Handle CLI commands BEFORE any server code runs
if (command === "--help" || command === "help") {
  showHelp();
}

if (args.includes("-v") || args.includes("--version")) {
  console.log(`ToolHub v${VERSION}`);
  process.exit(0);
}

// No arguments and not running as service => show help
if (args.length === 0 && !process.env.RUN_AS_SERVICE) {
  showHelp();
}

// Execute CLI command and exit immediately (no server startup)
if (command && cliCommands[command]) {
  await cliCommands[command]();
  process.exit(0);
}

// ─── Server Mode ────────────────────────────────────────────
import { dirname, join, extname } from "node:path";
import { existsSync } from "node:fs";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["*"],
    exposeHeaders: ["*"],
  }),
);

// Resolve the public directory by checking multiple possible locations
const findPublicDir = (): string => {
  const candidates = [
    // 1. Production: public/ next to the binary
    join(dirname(process.execPath), "public"),
    // 2. Production: public/ in CWD (for LaunchAgent with WorkingDirectory)
    join(process.cwd(), "public"),
    // 3. Production: ~/.toolhub/public (hardcoded fallback)
    join(process.env.HOME || "~", ".toolhub", "public"),
    // 4. Dev mode: apps/client/dist (relative to source file)
    join(import.meta.dir, "../../client/dist"),
  ];

  for (const dir of candidates) {
    if (existsSync(join(dir, "index.html"))) {
      return dir;
    }
  }
  return candidates[0]; // fallback
};

const publicDir = findPublicDir();

// MIME type mapping
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// Register and start modules
registry.register(systemModule);
registry.register(testModule);
registry.register(systemMonitorModule);
registry.register(jsonFormatterModule);

const startCore = async () => {
  await registry.initAll({
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`),
    },
  });
  await registry.startAutorunModules();
  registry.applyRoutes(app);

  // Serve Frontend: manual static file handler using absolute paths
  app.get("*", async (c) => {
    // Skip API routes
    if (c.req.path.startsWith("/api")) {
      return c.notFound();
    }

    // Try to serve the exact file
    const filePath = join(
      publicDir,
      c.req.path === "/" ? "index.html" : c.req.path,
    );
    if (existsSync(filePath)) {
      const file = Bun.file(filePath);
      const ext = extname(filePath);
      return new Response(file, {
        headers: {
          "Content-Type": MIME_TYPES[ext] || "application/octet-stream",
        },
      });
    }

    // SPA Fallback: serve index.html for client-side routing
    const indexPath = join(publicDir, "index.html");
    if (existsSync(indexPath)) {
      const file = Bun.file(indexPath);
      return new Response(file, {
        headers: { "Content-Type": "text/html" },
      });
    }

    return c.text("ToolHub API is running. Frontend not found.", 200);
  });

  console.log(
    `[Core] ToolHub Server v${VERSION} is running on http://localhost:${port}`,
  );
  console.log(`[Core] Serving frontend from: ${publicDir}`);
};

startCore();

export default {
  port,
  fetch: app.fetch,
};
