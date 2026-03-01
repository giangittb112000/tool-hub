import { useRef } from "react";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  error: string | null;
}

export function JsonEditor({ value, onChange, error }: JsonEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineCountRef = useRef<HTMLDivElement>(null);

  const lineCount = value ? value.split("\n").length : 1;

  const handleScroll = () => {
    if (textareaRef.current && lineCountRef.current) {
      lineCountRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 flex-shrink-0">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
          📝 Input
        </span>
        {error && (
          <span className="text-xs text-red-400 font-mono truncate ml-4 max-w-[60%]">
            ⚠ {error}
          </span>
        )}
      </div>
      <div className="flex-1 flex overflow-hidden">
        {/* Line numbers */}
        <div
          ref={lineCountRef}
          className="w-10 bg-zinc-950 border-r border-zinc-800 overflow-hidden flex-shrink-0 select-none"
        >
          <div className="py-3 px-1 text-right">
            {Array.from({ length: lineCount }, (_, i) => (
              <div
                key={i}
                className="text-[11px] font-mono text-zinc-700 leading-[1.625rem]"
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
        {/* Editor textarea — absolute fill to guarantee full height */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onScroll={handleScroll}
            placeholder='Paste your JSON here...

{"key": "value"}'
            spellCheck={false}
            className={`absolute inset-0 w-full h-full bg-transparent text-zinc-200 font-mono text-sm p-3 resize-none outline-none leading-relaxed placeholder:text-zinc-700 custom-scrollbar ${
              error ? "border-l-2 border-red-500/50" : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}
