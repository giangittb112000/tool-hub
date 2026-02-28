import { Hono } from "hono";
import { cors } from "hono/cors";
import { registry } from "./core/registry";
import { testModule } from "./modules/test/module";
import { systemMonitorModule } from "./modules/system-monitor/module";

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

const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.get("/", (c) => c.text("ToolHub API Core is running!"));

// Khởi chạy hệ thống Module
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

  console.log(`[Core] ToolHub Server is running on http://localhost:${port}`);
};

startCore();

export default {
  port,
  fetch: app.fetch,
};
