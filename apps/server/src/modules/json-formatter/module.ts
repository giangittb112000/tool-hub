import type { Hono } from "hono";
import type { CoreContext, ToolHubModule } from "@toolhub/shared";

export class JsonFormatterModule implements ToolHubModule {
  id = "module-json-formatter";
  name = "JSON Formatter Module";
  version = "1.0.0";
  autorun = false;

  async onInit(ctx: CoreContext): Promise<void> {
    ctx.logger.info("JSON Formatter Module initialized (client-only, no API).");
  }

  async onStart(): Promise<boolean> {
    return true;
  }

  async onStop(): Promise<boolean> {
    return true;
  }

  registerRoutes(_app: Hono) {
    // No API routes needed — all logic runs on client
  }
}

export const jsonFormatterModule = new JsonFormatterModule();
