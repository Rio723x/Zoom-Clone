import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

/**
 * Mobile bottom sheet: a panel that slides up from the bottom over a dimmed
 * backdrop. Stays mounted while closed (translated off-screen) so both the
 * enter and exit transitions play; `pointer-events-none` keeps it click-through
 * when hidden.
 */
export default function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  return (
    <div
      className={cn("fixed inset-0 z-40", !open && "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-black/60 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-x-0 bottom-0 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-panel pb-[max(1rem,env(safe-area-inset-bottom))] text-text-primary shadow-xl ring-1 ring-panel-border transition-transform duration-200 ease-out",
          open ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-panel-border" />
        {title && (
          <div className="flex h-12 items-center justify-between px-4">
            <h2 className="text-sm font-semibold">{title}</h2>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-hover"
              aria-label="Close"
            >
              <X className="h-4 w-4 text-text-secondary" />
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
