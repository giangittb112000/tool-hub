import {
  Activity,
  Globe,
  Shield,
  Terminal,
  Braces,
  RefreshCw,
  Github,
  Copy,
  Check,
} from "lucide-react";
import { ModuleCard } from "../components/ModuleCard";
import { useEffect, useState } from "react";
import { Modal } from "../components/ui/Modal";
import { useToast } from "../components/ui/Toast";
import { API_BASE } from "../constants";

export function Dashboard() {
  const [version, setVersion] = useState<string>("...");
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();
  const [isCopying, setIsCopying] = useState(false);

  const [updateInfo, setUpdateInfo] = useState<{
    needsUpdate: boolean;
    latestVersion: string;
    updateCommand: string;
  } | null>(null);

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/system/version`)
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion("Offline"));
  }, []);

  const handleCheckUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/system/check-update`);
      const data = await res.json();
      setUpdateInfo(data);

      if (data.needsUpdate) {
        setIsUpdateModalOpen(true);
        toast(`New version v${data.latestVersion} is available!`, "info");
      } else {
        toast("You are on the latest version!", "success");
      }
    } catch (e) {
      toast("Failed to check for updates.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyCommand = () => {
    if (updateInfo) {
      navigator.clipboard.writeText(updateInfo.updateCommand);
      setIsCopying(true);
      toast("Update command copied to clipboard!", "success");
      setTimeout(() => setIsCopying(false), 2000);
    }
  };

  const modules = [
    {
      id: "module-system-monitor",
      name: "System Monitor",
      description: "Real-time tracking of CPU, RAM, and system resources.",
      icon: Activity,
      status: "Running" as const,
      path: "/modules/system-monitor",
      color: "orange",
    },
    {
      id: "module-hosts",
      name: "Hosts Manager",
      description: "Manage local DNS records and map domains to localhost.",
      icon: Globe,
      status: "Stopped" as const,
      path: "/modules/hosts",
      color: "blue",
    },
    {
      id: "module-proxy",
      name: "Reverse Proxy",
      description: "Redirect traffic from custom domains to local processes.",
      icon: Shield,
      status: "Stopped" as const,
      path: "/modules/proxy",
      color: "purple",
    },
    {
      id: "module-mock",
      name: "Mock API",
      description: "Create fake endpoints for frontend development testing.",
      icon: Terminal,
      status: "Running" as const,
      path: "/modules/mock",
      color: "emerald",
    },
    {
      id: "module-json-formatter",
      name: "JSON Formatter",
      description: "Beautify, validate & compare JSON with multi-tab support.",
      icon: Braces,
      status: "Running" as const,
      path: "/modules/json-formatter",
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
            Module Overview
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl">
            Welcome back. Everything is running smoothly. Select a module below
            to start managing your local development environment.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {updateInfo?.needsUpdate && (
            <div className="flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-500/30 animate-pulse">
              <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">
                New Version v{updateInfo.latestVersion}
              </span>
            </div>
          )}
          <div className="flex items-center gap-4 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800/50 backdrop-blur-sm">
            <div className="text-right">
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">
                ToolHub Version
              </div>
              <div className="text-xl font-mono font-bold text-orange-500">
                v{version}
              </div>
            </div>
            <button
              onClick={handleCheckUpdate}
              disabled={isUpdating}
              className="p-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 transition-all border border-orange-500/20 active:scale-95 disabled:opacity-50"
              title="Check for Updates"
            >
              <RefreshCw
                className={`w-5 h-5 ${isUpdating ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>
      </header>

      {updateInfo?.needsUpdate && (
        <div
          className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 transition-all hover:bg-orange-500/10 cursor-pointer"
          onClick={() => setIsUpdateModalOpen(true)}
        >
          <div>
            <h3 className="text-lg font-bold text-zinc-100 italic">
              🔥 A new update is ready!
            </h3>
            <p className="text-zinc-500 text-sm">
              Update to v{updateInfo.latestVersion} to get the latest features
              and fixes.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-black font-bold text-sm shadow-lg shadow-orange-500/20">
            View Update
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.id} {...module} />
        ))}
      </div>

      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title="Software Update"
      >
        <div className="space-y-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-zinc-400 font-medium">
                New Version Available
              </div>
              <div className="text-xl font-bold text-white">
                ToolHub v{updateInfo?.latestVersion}
              </div>
            </div>
          </div>

          <p className="text-zinc-400 text-sm leading-relaxed">
            A newer version of ToolHub is available. To ensure reliability and
            access the latest features, we recommend updating your background
            service.
          </p>

          <div className="space-y-3">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">
              Update Command
            </div>
            <div className="flex items-center gap-2 p-3 bg-black rounded-xl border border-zinc-800 font-mono text-[11px] group relative overflow-hidden">
              <span className="text-zinc-400 truncate pr-10">
                {updateInfo?.updateCommand}
              </span>
              <button
                onClick={copyCommand}
                className="absolute right-2 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all active:scale-90"
              >
                {isCopying ? (
                  <Check className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              onClick={() => setIsUpdateModalOpen(false)}
              className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold transition-all border border-zinc-800"
            >
              Later
            </button>
            <button
              onClick={copyCommand}
              className="flex-[1.5] py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-black font-bold transition-all shadow-lg shadow-orange-500/20"
            >
              Copy & Update
            </button>
          </div>

          <p className="text-[10px] text-center text-zinc-600">
            Paste the command in your Terminal and restart the app after
            completion.
          </p>
        </div>
      </Modal>

      <footer className="pt-12 border-t border-zinc-900 flex items-center justify-between text-zinc-600 text-sm">
        <div className="flex items-center gap-2">
          <Github className="w-4 h-4" />
          <span>github.com/giangittb112000/tool-hub</span>
        </div>
        <div>Built for premium developer experience.</div>
      </footer>
    </div>
  );
}
