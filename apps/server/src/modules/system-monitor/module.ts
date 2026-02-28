import type { Hono } from "hono";
import type { CoreContext, ToolHubModule } from "@toolhub/shared";
import * as os from "node:os";

interface CpuSnapshot {
  idle: number;
  total: number;
}

export class SystemMonitorModule implements ToolHubModule {
  id = "module-system-monitor";
  name = "System Monitor Module";
  version = "1.1.0";
  autorun = true;

  private ctx!: CoreContext;
  private lastCpuSnapshots: CpuSnapshot[] = [];
  private serverStartTime: number = Date.now();

  async onInit(ctx: CoreContext): Promise<void> {
    this.ctx = ctx;
    this.lastCpuSnapshots = os.cpus().map((cpu) => this.getSnapshot(cpu));
    this.ctx.logger.info(
      "System Monitor Module (Advanced) has been initialized.",
    );
  }

  async onStart(): Promise<boolean> {
    this.ctx.logger.info("System Monitor Module started.");
    return true;
  }

  async onStop(): Promise<boolean> {
    this.ctx.logger.info("System Monitor Module stopped.");
    return true;
  }

  private getSnapshot(cpu: os.CpuInfo): CpuSnapshot {
    const times = cpu.times;
    const total = Object.values(times).reduce((acc, time) => acc + time, 0);
    return { idle: times.idle, total };
  }

  /**
   * Tính toán CPU Usage chính xác hơn dựa trên delta giữa 2 lần polling
   */
  private getDetailedCpuStats() {
    const currentCpus = os.cpus();
    const stats = currentCpus.map((cpu, i) => {
      const current = this.getSnapshot(cpu);
      const last = this.lastCpuSnapshots[i] || current;

      const idleDiff = current.idle - last.idle;
      const totalDiff = current.total - last.total;

      // Cập nhật snapshot cho lần sau
      this.lastCpuSnapshots[i] = current;

      const percentage =
        totalDiff === 0 ? 0 : Math.round((1 - idleDiff / totalDiff) * 100);
      return {
        model: cpu.model,
        speed: cpu.speed,
        percentage: Math.max(0, Math.min(100, percentage)),
      };
    });

    const average = Math.round(
      stats.reduce((acc, s) => acc + s.percentage, 0) / stats.length,
    );

    return {
      average,
      cores: stats,
    };
  }

  private getMemoryStats() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = Math.round((used / total) * 100);

    return {
      total,
      used,
      percentage,
    };
  }

  registerRoutes(app: Hono) {
    app.get("/api/system/stats", (c) => {
      const cpuStats = this.getDetailedCpuStats();
      const stats = {
        cpu: cpuStats,
        memory: this.getMemoryStats(),
        loadavg: os.loadavg(),
        uptime: os.uptime(),
        serverUptime: Math.floor((Date.now() - this.serverStartTime) / 1000),
        platform: os.platform(),
        arch: os.arch(),
        timestamp: new Date().toISOString(),
        network: Object.keys(os.networkInterfaces()).length,
      };
      return c.json(stats);
    });
  }
}

export const systemMonitorModule = new SystemMonitorModule();
