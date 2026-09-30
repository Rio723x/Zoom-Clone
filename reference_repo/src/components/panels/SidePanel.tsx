import type { ReactNode } from "react";
import { X } from "lucide-react";

interface SidePanelProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function SidePanel({ title, onClose, children, footer }: SidePanelProps) {
  return (
    <div className="absolute inset-0 z-20 flex h-full w-full flex-col bg-panel text-text-primary md:static md:inset-auto md:z-auto md:w-[340px] md:shrink-0">
      <div className="flex h-12 items-center justify-between border-b border-panel-border px-4">
        <h2 className="text-sm font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-hover"
          aria-label="Close panel"
        >
          <X className="h-4 w-4 text-text-secondary" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      {footer && (
        <div className="border-t border-panel-border p-3">{footer}</div>
      )}
    </div>
  );
}
