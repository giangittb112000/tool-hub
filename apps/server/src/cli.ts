import { exec } from "node:child_process";
import { promisify } from "node:util";
import { dirname } from "node:path";
import { writeFileSync } from "node:fs";

const execAsync = promisify(exec);

const PLIST_LABEL = "dev.toolhub.daemon";
const PLIST_PATH = `${process.env.HOME}/Library/LaunchAgents/${PLIST_LABEL}.plist`;

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

export const commands: Record<string, (port: number) => Promise<void>> = {
  start: async (port) => {
    console.log("🚀 Starting ToolHub Service...");

    try {
      await execAsync(`mkdir -p ${dirname(PLIST_PATH)}`);
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
  },

  stop: async () => {
    console.log("🛑 Stopping ToolHub Service...");
    try {
      await execAsync(`launchctl unload ${PLIST_PATH}`);
      console.log("✅ ToolHub Service stopped.");
    } catch {
      console.error("❌ Failed to stop. Is it already stopped?");
    }
  },

  status: async () => {
    try {
      const { stdout } = await execAsync(
        `launchctl list | grep ${PLIST_LABEL}`,
      );
      console.log(
        stdout.trim()
          ? "🟢 ToolHub Service is RUNNING"
          : "🔴 ToolHub Service is STOPPED",
      );
    } catch {
      console.log("🔴 ToolHub Service is STOPPED");
    }
  },

  update: async () => {
    console.log("🚀 To update ToolHub, run:");
    console.log("   npm update -g @giangnt112000/toolhub-cli");
  },
};
