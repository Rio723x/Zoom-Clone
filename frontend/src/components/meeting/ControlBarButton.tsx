import type { ComponentType } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/cn";

interface ControlBarButtonProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  active?: boolean;
  danger?: boolean;
  /** Green accent (Share Screen). */
  green?: boolean;
  /** Shows a small up-chevron affordance to the right (device/options menu). */
  hasMenu?: boolean;
  /** If set, the chevron is independently clickable (opens a menu). */
  onMenuClick?: () => void;
  badge?: number;
  onClick?: () => void;
  /** Fixed min width (px) so a changing label (Mute↔Unmute) doesn't shift the bar. */
  minWidth?: number;
  /** Greyed-out + non-interactive (e.g. host disabled this for participants). */
  disabled?: boolean;
  /** Disable just the chevron/options button, independently of the main button. */
  menuDisabled?: boolean;
  /** Native title tooltip (used to explain a disabled state). */
  title?: string;
}

export default function ControlBarButton({
  icon: Icon,
  label,
  active = false,
  danger = false,
  green = false,
  hasMenu = false,
  onMenuClick,
  badge,
  onClick,
  minWidth,
  disabled = false,
  menuDisabled = false,
  title,
}: ControlBarButtonProps) {
  const tint = green
    ? "text-share-green"
    : danger
      ? "text-leave-hover"
      : active
        ? "text-zoom-blue"
        : "text-text-primary";
  return (
    <div className="relative flex items-stretch">
      <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        style={minWidth ? { minWidth } : undefined}
        className={cn(
          "group relative flex h-14 min-w-[60px] flex-col items-center justify-center gap-1 rounded-lg px-3 transition-colors hover:bg-hover",
          disabled && "cursor-not-allowed opacity-40 hover:bg-transparent",
          tint,
        )}
      >
        {typeof badge === "number" && badge > 0 && (
          <span className="absolute right-2 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-leave px-1 text-[10px] font-semibold leading-none text-white">
            {badge}
          </span>
        )}
        <Icon className="h-6 w-6" />
        <span className="text-[11px] font-normal leading-none">{label}</span>
      </button>
      {hasMenu && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!menuDisabled) onMenuClick?.();
          }}
          disabled={menuDisabled}
          className={cn(
            "flex items-start pt-1.5 pr-0.5 text-text-secondary hover:text-text-primary",
            menuDisabled && "cursor-not-allowed opacity-40 hover:text-text-secondary",
          )}
          aria-label={`${label} options`}
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
