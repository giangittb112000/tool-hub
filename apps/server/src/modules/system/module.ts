import type { Hono } from "hono";
import type { CoreContext, ToolHubModule } from "@toolhub/shared";
// @ts-ignore
import pkg from "../../../../../package.json";
import { exec } from "node:child_process";

export class SystemModule implements ToolHubModule {
  id = "module-system";
  name = "System Management Module";
  version = pkg.version;
  autorun = true;

  private ctx!: CoreContext;

  async onInit(ctx: CoreContext): Promise<void> {
    this.ctx = ctx;
    this.ctx.logger.info(`System Module v${this.version} initialized.`);
  }

  async onStart(): Promise<boolean> {
    return true;
  }

  async onStop(): Promise<boolean> {
    return true;
  }

  registerRoutes(app: Hono) {
    // API Version cho Frontend
    app.get("/api/system/version", (c) => {
      return c.json({
        version: this.version,
        repo: "https://github.com/giangittb112000/tool-hub",
      });
    });

    app.post("/api/system/update", (c) => {
      this.ctx.logger.info("🚀 Update triggered from Web UI...");
      const updateCmd = `curl -fsSL https://raw.githubusercontent.com/giangittb112000/tool-hub/main/scripts/install.sh | bash`;

      exec(updateCmd, (err, stdout) => {
        if (err) {
          this.ctx.logger.error(`❌ Update failed: ${err.message}`);
        } else {
          console.log(stdout);
        }
        // Terminal script handles restart via LaunchAgent
        process.exit(0);
      });

      return c.json({ message: "Update process started" });
    });

    app.get("/api/system/check-update", async (c) => {
      try {
        const res = await fetch(
          "https://raw.githubusercontent.com/giangittb112000/tool-hub/main/package.json",
        );
        const data: any = await res.json();
        const latestVersion = data.version;

        return c.json({
          currentVersion: this.version,
          latestVersion: latestVersion,
          needsUpdate: latestVersion !== this.version,
          updateCommand: `curl -fsSL https://raw.githubusercontent.com/giangittb112000/tool-hub/main/scripts/install.sh | bash`,
        });
      } catch (e) {
        return c.json({ error: "Failed to check for updates" }, 500);
      }
    });
  }
}

export const systemModule = new SystemModule();
