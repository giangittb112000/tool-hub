import { Hono } from "hono";
import { type CoreContext, type ToolHubModule } from "@toolhub/shared";

class ModuleRegistry {
  private modules: Map<string, ToolHubModule> = new Map();
  private ctx!: CoreContext;

  register(module: ToolHubModule) {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} is already registered.`);
    }
    this.modules.set(module.id, module);
  }

  async initAll(ctx: CoreContext) {
    this.ctx = ctx;
    for (const [id, module] of this.modules) {
      try {
        this.ctx.logger.info(`Initializing module: ${module.name} (${id})`);
        await module.onInit(this.ctx);
      } catch (err) {
        this.ctx.logger.error(`Failed to initialize module ${id}: ${err}`);
      }
    }
  }

  async startAutorunModules() {
    for (const [id, module] of this.modules) {
      if (module.autorun) {
        try {
          this.ctx.logger.info(`Starting module: ${module.name}`);
          await module.onStart();
        } catch (err) {
          this.ctx.logger.error(`Failed to start module ${id}: ${err}`);
        }
      }
    }
  }

  applyRoutes(app: Hono) {
    for (const [id, module] of this.modules) {
      // Check if module has registerRoutes method (optional in Interface)
      if (
        "registerRoutes" in module &&
        typeof module.registerRoutes === "function"
      ) {
        module.registerRoutes(app);
      }
    }
  }
}

export const registry = new ModuleRegistry();
