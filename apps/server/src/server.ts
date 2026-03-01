import { Hono } from "hono";
import { cors } from "hono/cors";
import { dirname, join, extname } from "node:path";
import { existsSync } from "node:fs";
import { registry } from "./core/registry";
import { testModule } from "./modules/test/module";
import { systemMonitorModule } from "./modules/system-monitor/module";
import { systemModule } from "./modules/system/module";
import { jsonFormatterModule } from "./modules/json-formatter/module";

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

function findPublicDir(): string {
  const candidates = [
    join(dirname(process.execPath), "public"),
    join(process.cwd(), "public"),
    join(process.env.HOME || "~", ".toolhub", "public"),
    join(import.meta.dir, "../../client/dist"),
  ];

  for (const dir of candidates) {
    if (existsSync(join(dir, "index.html"))) return dir;
  }
  return candidates[0];
}

export function createServer(version: string, port: number) {
  const app = new Hono();
  const publicDir = findPublicDir();

  app.use(
    "*",
    cors({
      origin: "*",
      allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowHeaders: ["*"],
      exposeHeaders: ["*"],
    }),
  );

  // Register modules
  registry.register(systemModule);
  registry.register(testModule);
  registry.register(systemMonitorModule);
  registry.register(jsonFormatterModule);

  const start = async () => {
    await registry.initAll({
      logger: {
        info: (msg: string) => console.log(`[INFO] ${msg}`),
        error: (msg: string) => console.error(`[ERROR] ${msg}`),
      },
    });
    await registry.startAutorunModules();
    registry.applyRoutes(app);

    // Static file serving + SPA fallback
    app.get("*", async (c) => {
      if (c.req.path.startsWith("/api")) return c.notFound();

      const filePath = join(
        publicDir,
        c.req.path === "/" ? "index.html" : c.req.path,
      );
      if (existsSync(filePath)) {
        return new Response(Bun.file(filePath), {
          headers: {
            "Content-Type":
              MIME_TYPES[extname(filePath)] || "application/octet-stream",
          },
        });
      }

      const indexPath = join(publicDir, "index.html");
      if (existsSync(indexPath)) {
        return new Response(Bun.file(indexPath), {
          headers: { "Content-Type": "text/html" },
        });
      }

      return c.text("ToolHub API is running. Frontend not found.", 200);
    });

    console.log(
      `[Core] ToolHub Server v${version} is running on http://localhost:${port}`,
    );
    console.log(`[Core] Serving frontend from: ${publicDir}`);
  };

  start();

  return { port, fetch: app.fetch };
}
