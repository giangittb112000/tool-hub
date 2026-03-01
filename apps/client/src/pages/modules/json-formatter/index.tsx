import { useState, useCallback, useEffect, useRef } from "react";
import { ArrowLeft, Copy, Check, Trash2, Minimize2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Panel, Group, Separator } from "react-resizable-panels";
import { TabBar, type TabItem } from "./components/TabBar";
import { JsonEditor } from "./components/JsonEditor";
import { JsonOutput } from "./components/JsonOutput";

interface Tab {
  id: string;
  title: string;
  input: string;
  output: string;
  error: string | null;
}

let tabCounter = 1;

function createTab(): Tab {
  const id = `tab-${Date.now()}-${tabCounter}`;
  const title = `Tab ${tabCounter}`;
  tabCounter++;
  return { id, title, input: "", output: "", error: null };
}

export function JsonFormatter() {
  const [tabs, setTabs] = useState<Tab[]>([createTab()]);
  const [activeTabId, setActiveTabId] = useState(tabs[0].id);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  const [copied, setCopied] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const activeTab = tabs.find((t) => t.id === activeTabId) || tabs[0];

  const updateActiveTab = useCallback(
    (updates: Partial<Tab>) => {
      setTabs((prev) =>
        prev.map((t) => (t.id === activeTabId ? { ...t, ...updates } : t)),
      );
    },
    [activeTabId],
  );

  // Auto-format on input change (debounced)
  const handleInputChange = useCallback(
    (val: string) => {
      updateActiveTab({ input: val });

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (!val.trim()) {
        updateActiveTab({ input: val, output: "", error: null });
        return;
      }

      debounceRef.current = setTimeout(() => {
        try {
          const parsed = JSON.parse(val);
          const formatted = JSON.stringify(parsed, null, indentSize);
          updateActiveTab({ output: formatted, error: null });
        } catch (e: any) {
          updateActiveTab({ output: "", error: e.message });
        }
      }, 300);
    },
    [indentSize, updateActiveTab],
  );

  // Re-format when indent size changes
  useEffect(() => {
    if (!activeTab.input.trim()) return;
    try {
      const parsed = JSON.parse(activeTab.input);
      const formatted = JSON.stringify(parsed, null, indentSize);
      updateActiveTab({ output: formatted, error: null });
    } catch {
      // keep current error
    }
  }, [indentSize]);

  const handleMinify = useCallback(() => {
    if (!activeTab.input.trim()) return;
    try {
      const parsed = JSON.parse(activeTab.input);
      const minified = JSON.stringify(parsed);
      updateActiveTab({ output: minified, error: null, input: minified });
    } catch (e: any) {
      updateActiveTab({ output: "", error: e.message });
    }
  }, [activeTab.input, updateActiveTab]);

  const handleCopy = useCallback(() => {
    if (activeTab.output) {
      navigator.clipboard.writeText(activeTab.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [activeTab.output]);

  const handleClear = useCallback(() => {
    updateActiveTab({ input: "", output: "", error: null });
  }, [updateActiveTab]);

  const handleAddTab = useCallback(() => {
    const newTab = createTab();
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const handleCloseTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        const next = prev.filter((t) => t.id !== id);
        if (next.length === 0) {
          const fresh = createTab();
          setActiveTabId(fresh.id);
          return [fresh];
        }
        if (activeTabId === id) {
          const idx = prev.findIndex((t) => t.id === id);
          const nextActive = next[Math.min(idx, next.length - 1)];
          setActiveTabId(nextActive.id);
        }
        return next;
      });
    },
    [activeTabId],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M") {
        e.preventDefault();
        handleMinify();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "t") {
        e.preventDefault();
        handleAddTab();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleMinify, handleAddTab]);

  // Stats
  const inputSize = new Blob([activeTab.input]).size;
  const sizeLabel =
    inputSize > 1024 ? `${(inputSize / 1024).toFixed(1)} KB` : `${inputSize} B`;

  const tabItems: TabItem[] = tabs.map((t) => ({
    id: t.id,
    title: t.title,
  }));

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col -mx-4 md:-mx-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex-shrink-0 mb-3">
        <Link
          to="/"
          className="inline-flex items-center text-zinc-500 hover:text-orange-400 transition-all group text-sm mb-3"
        >
          <ArrowLeft
            size={14}
            className="mr-1.5 group-hover:-translate-x-1 transition-transform"
          />
          Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter">
              JSON Formatter
            </h1>
            <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded uppercase tracking-widest border border-emerald-500/20">
              Tool
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            <div
              className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 text-xs"
              title="Số khoảng trắng thụt đầu dòng"
            >
              <span className="px-2 py-1.5 text-zinc-600 border-r border-zinc-800">
                Indent
              </span>
              <button
                onClick={() => setIndentSize(2)}
                className={`px-2.5 py-1.5 transition-colors ${indentSize === 2 ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                2
              </button>
              <button
                onClick={() => setIndentSize(4)}
                className={`px-2.5 py-1.5 rounded-r-lg transition-colors ${indentSize === 4 ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}
              >
                4
              </button>
            </div>
            <button
              onClick={handleMinify}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-lg border border-zinc-800 transition-all active:scale-95"
            >
              <Minimize2 size={12} />
              Minify
            </button>
            <button
              onClick={handleCopy}
              disabled={!activeTab.output}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-lg border border-zinc-800 transition-all disabled:opacity-30 active:scale-95"
            >
              {copied ? (
                <Check size={12} className="text-emerald-400" />
              ) : (
                <Copy size={12} />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs rounded-lg border border-zinc-800 transition-all active:scale-95"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex-shrink-0">
        <TabBar
          tabs={tabItems}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onAddTab={handleAddTab}
          onCloseTab={handleCloseTab}
        />
      </div>

      {/* Resizable Panels */}
      <div className="flex-1 min-h-0 bg-zinc-900/40 border border-zinc-800 border-t-0 rounded-b-2xl overflow-hidden">
        <Group orientation="horizontal" className="h-full">
          <Panel defaultSize={45} minSize={25}>
            <JsonEditor
              value={activeTab.input}
              onChange={handleInputChange}
              error={activeTab.error}
            />
          </Panel>

          <Separator className="w-2 bg-zinc-800/50 hover:bg-orange-500/30 active:bg-orange-500/50 transition-colors cursor-col-resize flex items-center justify-center group">
            <div className="w-0.5 h-8 bg-zinc-600 rounded-full group-hover:bg-orange-400 transition-colors" />
          </Separator>

          <Panel defaultSize={55} minSize={25}>
            <JsonOutput output={activeTab.output} error={activeTab.error} />
          </Panel>
        </Group>
      </div>

      {/* Status bar */}
      <div className="flex-shrink-0 flex items-center justify-between gap-4 py-2 px-1 text-[11px] font-mono text-zinc-600">
        <div className="flex items-center gap-4">
          {activeTab.error ? (
            <span className="text-red-400">✗ Invalid JSON</span>
          ) : activeTab.output ? (
            <span className="text-emerald-500">✓ Valid JSON</span>
          ) : (
            <span>Paste JSON to auto-format</span>
          )}
          <span>Size: {sizeLabel}</span>
          <span>Indent: {indentSize}sp</span>
        </div>
        <span className="text-zinc-700 hidden sm:inline">
          Ctrl+T: New Tab · Ctrl+Shift+M: Minify
        </span>
      </div>
    </div>
  );
}
