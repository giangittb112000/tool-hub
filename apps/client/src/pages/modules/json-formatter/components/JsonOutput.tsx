import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import {
  JsonView,
  darkStyles,
  allExpanded,
  collapseAllNested,
} from "react-json-view-lite";
import {
  Search,
  ChevronsDownUp,
  ChevronsUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import "react-json-view-lite/dist/index.css";

interface JsonOutputProps {
  output: string;
  error: string | null;
}

const customStyles = {
  ...darkStyles,
  container: "json-tree-container",
  basicChildStyle: "json-tree-child",
  label: "json-tree-label",
  nullValue: "json-tree-null",
  undefinedValue: "json-tree-null",
  numberValue: "json-tree-number",
  stringValue: "json-tree-string",
  booleanValue: "json-tree-boolean",
  otherValue: "json-tree-other",
  punctuation: "json-tree-punctuation",
  collapseIcon: "json-tree-collapse-icon",
  expandIcon: "json-tree-expand-icon",
  collapsedContent: "json-tree-collapsed-content",
};

export function JsonOutput({ output, error }: JsonOutputProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentMatch, setCurrentMatch] = useState(0);
  const [totalMatches, setTotalMatches] = useState(0);
  const treeRef = useRef<HTMLDivElement>(null);
  // Force re-render key for expand/collapse toggle
  const [treeKey, setTreeKey] = useState(0);

  const parsed = useMemo(() => {
    if (!output) return null;
    try {
      return JSON.parse(output);
    } catch {
      return null;
    }
  }, [output]);

  const shouldExpandNode = useCallback(
    isExpanded ? allExpanded : collapseAllNested,
    [isExpanded],
  );

  const toggleExpand = (expand: boolean) => {
    setIsExpanded(expand);
    setTreeKey((k) => k + 1); // force re-mount to apply expand state
  };

  // Highlight search matches in the tree DOM
  useEffect(() => {
    if (!treeRef.current) return;

    // Clear previous highlights
    treeRef.current.querySelectorAll("mark.json-search-hit").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });

    if (!searchTerm.trim()) {
      setTotalMatches(0);
      setCurrentMatch(0);
      return;
    }

    // Walk text nodes and wrap matches with <mark>
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedTerm})`, "gi");
    const walker = document.createTreeWalker(
      treeRef.current,
      NodeFilter.SHOW_TEXT,
      null,
    );

    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (
        node.textContent &&
        regex.test(node.textContent) &&
        !(node.parentElement?.tagName === "MARK")
      ) {
        textNodes.push(node as Text);
      }
      regex.lastIndex = 0; // reset stateful regex
    }

    let count = 0;
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || "";
      const parts = text.split(regex);
      if (parts.length <= 1) return;

      const fragment = document.createDocumentFragment();
      parts.forEach((part) => {
        if (regex.test(part)) {
          const mark = document.createElement("mark");
          mark.className = "json-search-hit";
          mark.textContent = part;
          mark.dataset.matchIndex = String(count);
          count++;
          fragment.appendChild(mark);
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
        regex.lastIndex = 0;
      });

      textNode.parentNode?.replaceChild(fragment, textNode);
    });

    setTotalMatches(count);
    setCurrentMatch(count > 0 ? 1 : 0);

    // Scroll to first match
    if (count > 0) {
      const firstHit = treeRef.current.querySelector(
        'mark.json-search-hit[data-match-index="0"]',
      );
      firstHit?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [searchTerm, output, treeKey]);

  // Navigate to match by index
  const goToMatch = useCallback(
    (index: number) => {
      if (!treeRef.current || totalMatches === 0) return;

      // Remove active class from all
      treeRef.current
        .querySelectorAll("mark.json-search-active")
        .forEach((el) => el.classList.remove("json-search-active"));

      const targetIndex = (index - 1 + totalMatches) % totalMatches;
      const target = treeRef.current.querySelector(
        `mark.json-search-hit[data-match-index="${targetIndex}"]`,
      );
      if (target) {
        target.classList.add("json-search-active");
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        setCurrentMatch(targetIndex + 1);
      }
    },
    [totalMatches],
  );

  const nextMatch = () => goToMatch(currentMatch + 1);
  const prevMatch = () => goToMatch(currentMatch - 1);

  // Keyboard: Enter = next, Shift+Enter = prev
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) prevMatch();
      else nextMatch();
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header: Search + Expand/Collapse */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 flex-shrink-0 gap-2">
        {/* Search — always visible */}
        <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 gap-1.5 flex-1 max-w-xs">
          <Search size={12} className="text-zinc-600 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search in JSON..."
            className="bg-transparent text-xs text-zinc-300 outline-none flex-1 placeholder:text-zinc-600"
          />
          {searchTerm && totalMatches > 0 && (
            <>
              <span className="text-[10px] text-zinc-500 flex-shrink-0 tabular-nums">
                {currentMatch}/{totalMatches}
              </span>
              <button
                onClick={prevMatch}
                className="text-zinc-500 hover:text-orange-400 transition-colors"
                title="Previous (Shift+Enter)"
              >
                <ChevronUp size={12} />
              </button>
              <button
                onClick={nextMatch}
                className="text-zinc-500 hover:text-orange-400 transition-colors"
                title="Next (Enter)"
              >
                <ChevronDown size={12} />
              </button>
            </>
          )}
          {searchTerm && totalMatches === 0 && (
            <span className="text-[10px] text-red-400 flex-shrink-0">
              No results
            </span>
          )}
        </div>

        {/* Expand/Collapse All */}
        {parsed !== null && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={() => toggleExpand(true)}
              className={`p-1.5 rounded transition-colors ${
                isExpanded
                  ? "text-orange-400 bg-zinc-800"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              title="Expand All"
            >
              <ChevronsUpDown size={14} />
            </button>
            <button
              onClick={() => toggleExpand(false)}
              className={`p-1.5 rounded transition-colors ${
                !isExpanded
                  ? "text-orange-400 bg-zinc-800"
                  : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800"
              }`}
              title="Collapse All"
            >
              <ChevronsDownUp size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Tree View */}
      {parsed !== null ? (
        <div
          ref={treeRef}
          className="flex-1 overflow-auto custom-scrollbar p-3 text-sm font-mono"
        >
          <JsonView
            key={treeKey}
            data={parsed}
            shouldExpandNode={shouldExpandNode}
            style={customStyles}
          />
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4 opacity-20">&#123; &#125;</div>
            <p className="text-sm text-zinc-600">
              {error
                ? "Fix the error to see output"
                : "Paste JSON on the left — auto-formats instantly"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
