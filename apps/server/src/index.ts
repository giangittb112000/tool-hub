import { Hono } from "hono";
import { cors } from "hono/cors";
import { registry } from "./core/registry";
import { testModule } from "./modules/test/module";
import { systemMonitorModule } from "./modules/system-monitor/module";
import { systemModule } from "./modules/system/module";

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

// @ts-ignore
import pkg from "../../../package.json";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
const VERSION = pkg.version;

// Xử lý CLI Arguments
const args = process.argv.slice(2);
const command = args[0];

const showHelp = () => {
  console.log(`
🚀 ToolHub CLI v${VERSION}
Sử dụng: toolhub [lệnh]

Các lệnh có sẵn:
  start     Khởi chạy dịch vụ chạy ngầm (Background Service)
  stop      Dừng dịch vụ chạy ngầm
  update    Cập nhật ToolHub lên phiên bản mới nhất
  status    Kiểm tra trạng thái dịch vụ
  --help    Hiển thị hướng dẫn này
  -v        Hiển thị phiên bản
  `);
  process.exit(0);
};

if (
  command === "--help" ||
  command === "help" ||
  (args.length === 0 && !process.env.RUN_AS_SERVICE)
) {
  showHelp();
}

if (command === "update") {
  console.log("🚀 Updating ToolHub...");
  const updateCmd = `curl -fsSL https://raw.githubusercontent.com/giangittb112000/tool-hub/main/scripts/install.sh | bash`;
  import("node:child_process").then(({ exec }) => {
    exec(updateCmd, (err, stdout) => {
      if (err) console.error("❌ Update failed:", err);
      else console.log(stdout);
      process.exit(0);
    });
  });
} else if (command === "start") {
  console.log("🚀 Starting ToolHub Service...");
  import("node:child_process").then(({ exec }) => {
    const plist = `${process.env.HOME}/Library/LaunchAgents/dev.toolhub.daemon.plist`;
    exec(`launchctl load ${plist}`, (err) => {
      if (err)
        console.error("❌ Failed to start service. Is it already running?");
      else
        console.log(
          "✅ ToolHub Service started. Access at http://localhost:3001",
        );
      process.exit(0);
    });
  });
} else if (command === "stop") {
  console.log("🛑 Stopping ToolHub Service...");
  import("node:child_process").then(({ exec }) => {
    const plist = `${process.env.HOME}/Library/LaunchAgents/dev.toolhub.daemon.plist`;
    exec(`launchctl unload ${plist}`, (err) => {
      if (err)
        console.error("❌ Failed to stop service. Is it already stopped?");
      else console.log("✅ ToolHub Service stopped.");
      process.exit(0);
    });
  });
} else if (command === "status") {
  import("node:child_process").then(({ exec }) => {
    exec(`launchctl list | grep dev.toolhub.daemon`, (err, stdout) => {
      if (stdout) console.log("🟢 ToolHub Service is RUNNING");
      else console.log("🔴 ToolHub Service is STOPPED");
      process.exit(0);
    });
  });
} else if (args.includes("-v") || args.includes("--version")) {
  console.log(`ToolHub v${VERSION}`);
  process.exit(0);
}

app.get("/", (c) => c.text("ToolHub API Core is running!"));

// Khởi chạy hệ thống Module
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

  // Gắn router của các module vào Hono
  registry.applyRoutes(app);

  console.log(
    `[Core] ToolHub Server v${VERSION} is running on http://localhost:${port}`,
  );
};

startCore();

export default {
  port,
  fetch: app.fetch,
};
