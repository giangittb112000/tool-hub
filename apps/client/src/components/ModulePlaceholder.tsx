import { Link } from "react-router-dom";
import { ArrowLeft, Construction } from "lucide-react";

interface PlaceholderProps {
  title: string;
}

export function ModulePlaceholder({ title }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
      <div className="p-6 bg-orange-500/10 text-orange-500 rounded-full animate-pulse">
        <Construction size={64} />
      </div>
      <div className="space-y-2">
        <h1 className="text-4xl font-black">{title}</h1>
        <p className="text-zinc-500 max-w-sm">
          This module is currently under development according to our system
          roadmap.
        </p>
      </div>
      <Link
        to="/"
        className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition-colors inline-flex items-center group text-sm font-bold"
      >
        <ArrowLeft
          size={16}
          className="mr-2 group-hover:-translate-x-1 transition-transform"
        />
        Return to Dashboard
      </Link>
    </div>
  );
}
