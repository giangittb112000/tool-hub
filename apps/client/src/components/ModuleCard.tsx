import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ModuleCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  status: "Running" | "Stopped" | "Warning";
  path: string;
  color: string;
}

export function ModuleCard({
  name,
  description,
  icon: Icon,
  status,
  path,
  color,
}: ModuleCardProps) {
  const statusColor = {
    Running: "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]",
    Stopped: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]",
    Warning: "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.8)]",
  };

  return (
    <Link
      to={path}
      className={`group relative p-6 border border-zinc-800 rounded-2xl bg-zinc-900 shadow-xl overflow-hidden transition-all duration-500 hover:border-${color}-500/50 hover:scale-[1.02] active:scale-[0.98] block text-left`}
    >
      <div
        className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-${color}-500/10 transition-colors duration-500`}
      ></div>

      <div className="flex justify-between items-start mb-4">
        <div
          className={`p-3 rounded-xl bg-zinc-800 text-${color}-400 group-hover:text-white group-hover:bg-${color}-500 transition-all duration-300`}
        >
          <Icon size={24} />
        </div>
        <div className="flex items-center space-x-2">
          <span
            className={`w-2 h-2 rounded-full ${statusColor[status]} animate-pulse`}
          ></span>
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            {status}
          </span>
        </div>
      </div>

      <h3 className="text-xl font-bold text-zinc-100 mb-2">{name}</h3>
      <p className="text-sm text-zinc-400 line-clamp-2">{description}</p>

      <div className="mt-6 flex items-center text-xs font-bold text-zinc-500 uppercase tracking-tighter group-hover:text-zinc-200 transition-colors">
        Enter Module
        <span className="ml-2 group-hover:translate-x-1 transition-transform">
          →
        </span>
      </div>
    </Link>
  );
}
