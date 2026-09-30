import type { ReactNode } from "react";
import { ExternalLink, X } from "lucide-react";

interface SidePanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SidePanel({ title, onClose, children, footer }: SidePanelProps) {
  return (
    <div className="absolute inset-0 z-20 flex h-full w-full flex-col bg-[#1f1f21] text-text-primary md:static md:inset-auto md:z-auto md:w-[360px] md:shrink-0 md:border-l md:border-white/10">
      <div className="relative flex h-12 items-center justify-center border-b border-white/10 px-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <div className="absolute right-3 flex items-center gap-1">
          <button
            className="hidden h-7 w-7 items-center justify-center rounded-md hover:bg-white/10 md:flex"
            aria-label="Pop out"
            title="Pop out"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-white/10"
            aria-label="Close panel"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && <div className="p-3">{footer}</div>}
    </div>
  );
}
