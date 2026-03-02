import { exec, spawn } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join } from "node:path";
import {
  writeFileSync,
  readFileSync,
  existsSync,
  unlinkSync,
  mkdirSync,
} from "node:fs";
import { homedir, platform } from "node:os";

const execAsync = promisify(exec);

// ─── Platform Detection ─────────────────────────────────────
const IS_WINDOWS = platform() === "win32";
const IS_MACOS = platform() === "darwin";
const HOME_DIR = homedir();

// ─── macOS LaunchAgent Config ────────────────────────────────
const PLIST_LABEL = "dev.toolhub.daemon";
const PLIST_PATH = join(
  HOME_DIR,
  "Library",
  "LaunchAgents",
  `${PLIST_LABEL}.plist`,
);

// ─── Cross-platform PID file (Windows & Linux) ──────────────
const TOOLHUB_DATA_DIR = IS_WINDOWS
  ? join(process.env.APPDATA || join(HOME_DIR, "AppData", "Roaming"), "ToolHub")
  : join(HOME_DIR, ".toolhub");
const PID_FILE = join(TOOLHUB_DATA_DIR, "toolhub.pid");
const LOG_FILE = join(TOOLHUB_DATA_DIR, "toolhub.log");
const ERROR_LOG_FILE = join(TOOLHUB_DATA_DIR, "toolhub.error.log");

function ensureDataDir(): void {
  if (!existsSync(TOOLHUB_DATA_DIR)) {
    mkdirSync(TOOLHUB_DATA_DIR, { recursive: true });
  }
}

// ─── macOS LaunchAgent plist generation ──────────────────────
function generatePlist(binaryPath: string): string {
  const workDir = dirname(binaryPath);
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_LABEL}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${binaryPath}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${workDir}</string>
    <key>RunAtLoad</key>
    <false/>
    <key>KeepAlive</key>
    <true/>
    <key>EnvironmentVariables</key>
    <dict>
        <key>RUN_AS_SERVICE</key>
        <string>true</string>
    </dict>
    <key>StandardOutPath</key>
    <string>${workDir}/toolhub.log</string>
    <key>StandardErrorPath</key>
    <string>${workDir}/toolhub.error.log</string>
</dict>
</plist>`;
}

// ─── PID-based process management (Windows & Linux) ──────────
function readPid(): number | null {
  try {
    if (!existsSync(PID_FILE)) return null;
    const pid = parseInt(readFileSync(PID_FILE, "utf-8").trim(), 10);
    return isNaN(pid) ? null : pid;
  } catch {
    return null;
  }
}

function writePid(pid: number): void {
  ensureDataDir();
  writeFileSync(PID_FILE, String(pid), "utf-8");
}

function removePidFile(): void {
  try {
    if (existsSync(PID_FILE)) unlinkSync(PID_FILE);
  } catch {
    // ignore
  }
}

function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

// ─── Help & Version ──────────────────────────────────────────
export function showHelp(version: string): never {
  console.log(`
🚀 ToolHub CLI v${version}
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
}

export function showVersion(version: string): never {
  console.log(`ToolHub v${version}`);
  process.exit(0);
}

// ─── Platform-specific: macOS start ──────────────────────────
async function startMacOS(port: number): Promise<void> {
  try {
    const plistDir = dirname(PLIST_PATH);
    if (!existsSync(plistDir)) {
      mkdirSync(plistDir, { recursive: true });
    }
    writeFileSync(PLIST_PATH, generatePlist(process.execPath));
  } catch (e) {
    console.error("❌ Failed to create LaunchAgent:", e);
    return;
  }

  try {
    await execAsync(`launchctl unload ${PLIST_PATH} 2>/dev/null || true`);
    await execAsync(`launchctl load ${PLIST_PATH}`);
    console.log(
      `✅ ToolHub Service started. Access at http://localhost:${port}`,
    );
  } catch {
    console.error("❌ Failed to start. Is it already running?");
  }
}

// ─── Platform-specific: macOS stop ───────────────────────────
async function stopMacOS(): Promise<void> {
  try {
    await execAsync(`launchctl unload ${PLIST_PATH}`);
    console.log("✅ ToolHub Service stopped.");
  } catch {
    console.error("❌ Failed to stop. Is it already stopped?");
  }
}

// ─── Platform-specific: macOS status ─────────────────────────
async function statusMacOS(): Promise<void> {
  try {
    const { stdout } = await execAsync(`launchctl list | grep ${PLIST_LABEL}`);
    console.log(
      stdout.trim()
        ? "🟢 ToolHub Service is RUNNING"
        : "🔴 ToolHub Service is STOPPED",
    );
  } catch {
    console.log("🔴 ToolHub Service is STOPPED");
  }
}

// ─── Platform-specific: Windows/Linux start (PID-based) ─────
async function startGeneric(port: number): Promise<void> {
  const existingPid = readPid();
  if (existingPid && isProcessRunning(existingPid)) {
    console.log(
      `⚠️  ToolHub Service is already running (PID: ${existingPid}).`,
    );
    console.log(`   Access at http://localhost:${port}`);
    return;
  }

  ensureDataDir();

  try {
    const child = spawn(process.execPath, [], {
      detached: true,
      stdio: "ignore",
      env: {
        ...process.env,
        RUN_AS_SERVICE: "true",
        PORT: String(port),
      },
      cwd: dirname(process.execPath),
    });

    if (child.pid) {
      writePid(child.pid);
      child.unref();
      console.log(
        `✅ ToolHub Service started (PID: ${child.pid}). Access at http://localhost:${port}`,
      );
      console.log(`   Logs: ${LOG_FILE}`);
    } else {
      console.error("❌ Failed to start ToolHub Service — no PID returned.");
    }
  } catch (e) {
    console.error("❌ Failed to start ToolHub Service:", e);
  }
}

// ─── Platform-specific: Windows/Linux stop (PID-based) ──────
async function stopGeneric(): Promise<void> {
  const pid = readPid();
  if (!pid) {
    console.log("🔴 ToolHub Service is not running (no PID file found).");
    return;
  }

  if (!isProcessRunning(pid)) {
    console.log("🔴 ToolHub Service is not running (stale PID file).");
    removePidFile();
    return;
  }

  try {
    if (IS_WINDOWS) {
      await execAsync(`taskkill /PID ${pid} /F /T`);
    } else {
      process.kill(pid, "SIGTERM");
    }
    removePidFile();
    console.log(`✅ ToolHub Service stopped (PID: ${pid}).`);
  } catch (e) {
    console.error("❌ Failed to stop ToolHub Service:", e);
    removePidFile();
  }
}

// ─── Platform-specific: Windows/Linux status (PID-based) ────
async function statusGeneric(): Promise<void> {
  const pid = readPid();
  if (!pid) {
    console.log("🔴 ToolHub Service is STOPPED");
    return;
  }

  if (isProcessRunning(pid)) {
    console.log(`🟢 ToolHub Service is RUNNING (PID: ${pid})`);
  } else {
    console.log("🔴 ToolHub Service is STOPPED (stale PID file cleaned)");
    removePidFile();
  }
}

// ─── Exported commands ───────────────────────────────────────
export const commands: Record<string, (port: number) => Promise<void>> = {
  start: async (port) => {
    console.log("🚀 Starting ToolHub Service...");
    if (IS_MACOS) {
      await startMacOS(port);
    } else {
      await startGeneric(port);
    }
  },

  stop: async () => {
    console.log("🛑 Stopping ToolHub Service...");
    if (IS_MACOS) {
      await stopMacOS();
    } else {
      await stopGeneric();
    }
  },

  status: async () => {
    if (IS_MACOS) {
      await statusMacOS();
    } else {
      await statusGeneric();
    }
  },

  update: async () => {
    console.log("🚀 To update ToolHub, run:");
    console.log("   npm update -g @giangnt112000/toolhub-cli");
  },
};
