import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Settings, LogOut, Terminal, LayoutDashboard } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Terminal, label: "Console", path: "/console" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-zinc-900 bg-zinc-950 flex flex-col items-center md:items-stretch transition-all duration-300">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
              <span className="font-black text-xl text-zinc-950">T</span>
            </div>
            <span className="hidden md:block font-black text-xl tracking-tighter">
              TOOLHUB
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-orange-500/10 text-orange-400"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900"
                }`}
              >
                <Icon
                  size={24}
                  className={
                    isActive
                      ? "text-orange-400"
                      : "group-hover:scale-110 transition-transform"
                  }
                />
                <span
                  className={`hidden md:block font-medium ${isActive ? "text-zinc-100" : ""}`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-900">
          <button className="flex items-center space-x-3 w-full px-3 py-3 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all group">
            <LogOut
              size={24}
              className="group-hover:rotate-180 transition-transform duration-500"
            />
            <span className="hidden md:block font-medium">Exit Tool</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative custom-scrollbar">
        {/* Top Glow Background */}
        <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-orange-500/10 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="p-6 md:p-12 max-w-full mx-auto relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
