import { type CoreContext, type ToolHubModule } from "@toolhub/shared";
import type { Hono } from "hono";

export const testModule: ToolHubModule & { registerRoutes(app: Hono): void } = {
  id: "module-test",
  name: "Test Setup Module",
  version: "1.0.0",
  autorun: true,

  async onInit(ctx: CoreContext) {
    ctx.logger.info("Test Module has been initialized.");
  },

  async onStart() {
    // In actual modules, we could start a secondary server or process here
    console.log("[TestModule] Module started successfully.");
    return true;
  },

  async onStop() {
    console.log("[TestModule] Module stopped.");
    return true;
  },

  registerRoutes(app: Hono) {
    app.get("/api/test", (c) => {
      return c.json({
        status: "success",
        message: "Hello from Test Module",
        timestamp: new Date().toISOString(),
      });
    });
  },
};
