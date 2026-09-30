import { Check, ChevronsLeft, ChevronsRight, MoreHorizontal, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

// Matches the desktop Zoom reactions popover: clap, thumbs-up, joy, open-mouth, heart, tada.
const EMOJIS = ["👏", "👍", "😂", "😮", "❤️", "🎉"];

// Non-verbal feedback row. Each one is broadcast as a plain emoji reaction.
const STATUS: { emoji: string; label: string; icon: ReactNode; bg: string }[] = [
  {
    emoji: "✅",
    label: "Yes",
    bg: "bg-[#2fb457]",
    icon: <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />,
  },
  {
    emoji: "❌",
    label: "No",
    bg: "bg-[#e5484d]",
    icon: <X className="h-3.5 w-3.5 text-white" strokeWidth={3} />,
  },
  {
    emoji: "⏪",
    label: "Slow down",
    bg: "bg-[#6b6f80]",
    icon: <ChevronsLeft className="h-3.5 w-3.5 text-white" strokeWidth={3} />,
  },
  {
    emoji: "⏩",
    label: "Speed up",
    bg: "bg-[#1a73e8]",
    icon: <ChevronsRight className="h-3.5 w-3.5 text-white" strokeWidth={3} />,
  },
  {
    emoji: "☕",
    label: "Away",
    bg: "",
    icon: <span className="text-base leading-none">☕</span>,
  },
];

interface ReactionsFlyoutProps {
  onReact: (emoji: string) => void;
  onRaiseHand: () => void;
  /** Stretch to the container width (mobile More sheet) instead of the fixed
      popover width used on desktop. */
  fullWidth?: boolean;
}

export default function ReactionsFlyout({
  onReact,
  onRaiseHand,
  fullWidth = false,
}: ReactionsFlyoutProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[#1c1c1e] p-2 shadow-xl ring-1 ring-white/10",
        fullWidth ? "w-full" : "w-[282px]",
      )}
    >
      {/* Emoji row + more */}
      <div className="flex items-center justify-between px-0.5 pb-2 pt-0.5">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => onReact(e)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[22px] transition-transform hover:scale-125"
          >
            {e}
          </button>
        ))}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full text-text-secondary hover:bg-white/10 hover:text-text-primary"
          aria-label="More reactions"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      {/* Status row */}
      <div className="grid grid-cols-5 gap-1.5 pb-2">
        {STATUS.map((s) => (
          <button
            key={s.emoji}
            onClick={() => onReact(s.emoji)}
            title={s.label}
            aria-label={s.label}
            className="flex h-8 items-center justify-center rounded-lg bg-[#2b2b2e] transition-colors hover:bg-[#38383c]"
          >
            <span
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full",
                s.bg,
              )}
            >
              {s.icon}
            </span>
          </button>
        ))}
      </div>

      {/* Hand / away bars */}
      <div className="space-y-1.5">
        <button
          onClick={onRaiseHand}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#2b2b2e] text-[13px] font-semibold text-text-primary transition-colors hover:bg-[#38383c]"
        >
          <span className="text-base leading-none">✋</span>
          Raise Hand
        </button>
        <button
          onClick={() => onReact("⏳")}
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-[#2b2b2e] text-[13px] font-semibold text-text-primary transition-colors hover:bg-[#38383c]"
        >
          <span className="text-base leading-none">⏳</span>
          Be right back
        </button>
      </div>
    </div>
  );
}
