import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Cpu, HardDrive, Zap, Globe, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface CoreInfo {
  model: string;
  speed: number;
  percentage: number;
}

interface SystemStats {
  cpu: {
    average: number;
    cores: CoreInfo[];
  };
  memory: {
    total: number;
    used: number;
    percentage: number;
  };
  loadavg: number[];
  uptime: number;
  serverUptime: number;
  platform: string;
  arch: string;
  network: number;
  timestamp: string;
}

export function SystemMonitor() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [history, setHistory] = useState<number[]>([]);
  const MAX_HISTORY = 30;

  useEffect(() => {
    const fetchStats = () => {
      fetch("http://localhost:3001/api/system/stats")
        .then((r) => r.json())
        .then((d) => {
          setStats(d);
          setHistory((prev) => [
            ...prev.slice(-(MAX_HISTORY - 1)),
            d.cpu.average,
          ]);
        })
        .catch((e) => console.error("Monitor error:", e));
    };

    fetchStats();
    const interval = setInterval(fetchStats, 2000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // Generate SVG Path for history chart
  const chartPath = useMemo(() => {
    if (history.length < 2) return "";
    const width = 400;
    const height = 100;
    const step = width / (MAX_HISTORY - 1);

    return history
      .map((val, i) => {
        const x = i * step;
        const y = height - (val / 100) * height;
        return `${i === 0 ? "M" : "L"} ${x} ${y}`;
      })
      .join(" ");
  }, [history]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      <Link
        to="/"
        className="inline-flex items-center text-zinc-500 hover:text-orange-400 transition-all group"
      >
        <ArrowLeft
          size={16}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        Back to Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-900 pb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-5xl font-black tracking-tighter">
              System Pulse
            </h1>
            <span className="px-2 py-1 bg-orange-500/10 text-orange-500 text-[10px] font-bold rounded uppercase tracking-widest border border-orange-500/20">
              Live
            </span>
          </div>
          <p className="text-zinc-500">
            Advanced hardware telemetry & real-time analytics
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm min-w-[120px]">
            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
              Architecture
            </div>
            <div className="text-lg font-bold text-zinc-200">
              {stats?.arch || "..."}
            </div>
          </div>
          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 backdrop-blur-sm min-w-[120px]">
            <div className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
              Platform
            </div>
            <div className="text-lg font-bold text-orange-400 capitalize">
              {stats?.platform || "..."}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main CPU & History */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50"></div>

            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Cpu className="text-orange-500" size={20} />
                  CPU Performance
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-1">
                  {stats?.cpu.cores?.[0]?.model || "Loading processor..."}
                </p>
              </div>
              <div className="text-right">
                <div className="text-5xl font-black text-white">
                  {stats?.cpu.average || 0}%
                </div>
                <div className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase">
                  Utilization
                </div>
              </div>
            </div>

            {/* History Graph */}
            <div className="h-32 w-full mt-4 relative">
              <svg
                viewBox="0 0 400 100"
                preserveAspectRatio="none"
                className="w-full h-full"
              >
                <defs>
                  <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${chartPath} L 400 100 L 0 100 Z`}
                  fill="url(#gradient)"
                  className="transition-all duration-1000"
                />
                <path
                  d={chartPath}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="2"
                  className="transition-all duration-1000"
                />
              </svg>
            </div>

            {/* Core Grid */}
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mt-8">
              {stats?.cpu.cores.map((core, i) => (
                <div key={i} className="space-y-1">
                  <div className="bg-zinc-950 h-12 rounded-lg border border-zinc-800 relative overflow-hidden flex items-end">
                    <div
                      className={`w-full transition-all duration-1000 ${core.percentage > 80 ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" : "bg-orange-500"}`}
                      style={{ height: `${core.percentage}%` }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">
                      {core.percentage}%
                    </span>
                  </div>
                  <div className="text-[8px] text-zinc-600 text-center font-mono">
                    C{i}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Globe className="text-blue-400 mb-2" size={24} />
              <div className="text-2xl font-black">{stats?.network || 0}</div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">
                Interfaces
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Clock className="text-emerald-400 mb-2" size={24} />
              <div className="text-2xl font-black">
                {formatUptime(stats?.serverUptime || 0)}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">
                ToolHub Uptime
              </div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center">
              <Zap className="text-yellow-400 mb-2" size={24} />
              <div className="text-xl font-bold">
                {stats?.loadavg?.[0]?.toFixed(2) || "0.00"}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase font-mono">
                Load Avg (1m)
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Panel - Memory & OS */}
        <div className="space-y-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 relative overflow-hidden group">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-8">
              <HardDrive className="text-blue-500" size={20} />
              Memory Stack
            </h3>

            <div className="relative h-48 w-48 mx-auto flex items-center justify-center mb-8">
              {/* Circular Progress (Simple) */}
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#18181b"
                  strokeWidth="12"
                  fill="none"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="80"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={
                    2 *
                    Math.PI *
                    80 *
                    (1 - (stats?.memory.percentage || 0) / 100)
                  }
                  className="transition-all duration-1000 ease-in-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-black">
                  {stats?.memory.percentage || 0}%
                </div>
                <div className="text-[10px] text-zinc-500 font-mono">
                  In Use
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Allocated</span>
                <span className="text-zinc-200 font-medium">
                  {stats ? formatBytes(stats.memory.used) : "..."}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Total System</span>
                <span className="text-zinc-200 font-medium">
                  {stats ? formatBytes(stats.memory.total) : "..."}
                </span>
              </div>
              <div className="pt-4 border-t border-zinc-800">
                <div className="text-[10px] text-zinc-500 uppercase mb-2">
                  System Uptime
                </div>
                <div className="text-sm font-bold text-zinc-300">
                  {formatUptime(stats?.uptime || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 px-4 py-2 bg-zinc-900 rounded-full border border-zinc-800 text-xs text-zinc-400">
            <Clock size={12} className="animate-spin-slow" />
            <span>Polling: 2000ms</span>
          </div>
          <div className="bg-zinc-950 p-6 rounded-3xl border border-zinc-800/50 text-center">
            <p className="text-[10px] text-zinc-600 font-mono">
              Last data pulse received:{" "}
              {stats?.timestamp?.split("T")[1]?.split(".")[0] || "--:--:--"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
