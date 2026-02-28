import { useState, createContext, useContext, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`
              pointer-events-auto min-w-[300px] max-w-md p-4 rounded-2xl border shadow-lg flex items-start gap-3 
              animate-in slide-in-from-right duration-300
              ${
                t.type === "success"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-400"
                  : t.type === "error"
                    ? "bg-red-950/20 border-red-500/30 text-red-400"
                    : "bg-zinc-900 border-zinc-800 text-zinc-100"
              }
              backdrop-blur-xl relative
            `}
          >
            {t.type === "success" && (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            {t.type === "error" && (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            {t.type === "info" && (
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}

            <div className="flex-1 text-sm font-medium pr-6 leading-relaxed">
              {t.message}
            </div>

            <button
              onClick={() => removeToast(t.id)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}
