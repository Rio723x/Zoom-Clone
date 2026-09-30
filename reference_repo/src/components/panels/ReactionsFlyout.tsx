import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/cn";

// Matches Figma reactions.png: clap, thumbs-up, heart, joy, open-mouth, tada.
const EMOJIS = ["👏", "👍", "❤️", "😂", "😮", "🎉"];

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
        "overflow-hidden rounded-2xl bg-tile p-2 shadow-xl ring-1 ring-black/40",
        fullWidth ? "w-full" : "w-64",
      )}
    >
      {/* Emoji row + more */}
      <div className="flex items-center justify-between px-1 pb-2 pt-1">
        {EMOJIS.map((e) => (
          <button
            key={e}
            onClick={() => onReact(e)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-2xl transition-transform hover:scale-125"
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

      {/* Raise Hand bar */}
      <button
        onClick={onRaiseHand}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-black/30 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-black/50"
      >
        <span className="text-lg">✋</span>
        Raise Hand
      </button>
    </div>
  );
}
