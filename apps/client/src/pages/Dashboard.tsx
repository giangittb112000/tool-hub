import { Activity, Globe, Shield, Terminal } from "lucide-react";
import { ModuleCard } from "../components/ModuleCard";

export function Dashboard() {
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
      status: "Stopped" as const,
      path: "/modules/mock",
      color: "emerald",
    },
  ];

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 to-zinc-500">
          Module Overview
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl">
          Welcome back. Everything is running smoothly. Select a module below to
          start managing your local development environment.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <ModuleCard key={module.id} {...module} />
        ))}
      </div>
    </div>
  );
}
