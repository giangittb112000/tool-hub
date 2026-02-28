import { Hono } from "hono";
import { cors } from "hono/cors";
import { serveStatic } from "hono/bun";
import { exec } from "node:child_process";
import { promisify } from "node:util";
import { registry } from "./core/registry";
import { testModule } from "./modules/test/module";
import { systemMonitorModule } from "./modules/system-monitor/module";
import { systemModule } from "./modules/system/module";

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
    console.log("🚀 Updating ToolHub...");
    try {
      const { stdout } = await execAsync(
        `curl -fsSL "https://raw.githubusercontent.com/giangittb112000/tool-hub/main/scripts/install.sh?t=$(date +%s)" | bash`,
      );
      console.log(stdout);
    } catch (err) {
      console.error("❌ Update failed:", err);
    }
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

// Register and start modules
registry.register(systemModule);
registry.register(testModule);
registry.register(systemMonitorModule);

const startCore = async () => {
  await registry.initAll({
    logger: {
      info: (msg: string) => console.log(`[INFO] ${msg}`),
      error: (msg: string) => console.error(`[ERROR] ${msg}`),
    },
  });
  await registry.startAutorunModules();
  registry.applyRoutes(app);

  // Serve Frontend static files (from ./public directory next to binary)
  app.use("/*", serveStatic({ root: "./public" }));
  app.get("*", serveStatic({ path: "./public/index.html" }));

  console.log(
    `[Core] ToolHub Server v${VERSION} is running on http://localhost:${port}`,
  );
};

startCore();

export default {
  port,
  fetch: app.fetch,
};
