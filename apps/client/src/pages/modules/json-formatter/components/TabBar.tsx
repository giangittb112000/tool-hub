import { Plus, X } from "lucide-react";

export interface TabItem {
  id: string;
  title: string;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onCloseTab: (id: string) => void;
}

export function TabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onAddTab,
  onCloseTab,
}: TabBarProps) {
  return (
    <div className="flex items-center gap-1 border-b border-zinc-800 overflow-x-auto custom-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSelectTab(tab.id)}
          className={`group flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
            activeTabId === tab.id
              ? "text-orange-400 border-orange-500 bg-zinc-900/50"
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/30"
          }`}
        >
          <span>{tab.title}</span>
          {tabs.length > 1 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.id);
              }}
              className="ml-1 p-0.5 rounded hover:bg-zinc-700 text-zinc-600 hover:text-zinc-300 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={12} />
            </span>
          )}
        </button>
      ))}
      <button
        onClick={onAddTab}
        className="flex items-center gap-1 px-3 py-2.5 text-zinc-600 hover:text-orange-400 transition-colors text-sm"
        title="New Tab (Ctrl+T)"
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
