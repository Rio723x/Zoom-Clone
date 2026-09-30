import { useState, type ReactNode } from "react";
import { ShieldCheck, LayoutGrid, User, ChevronDown, Info, Check, Github, KeyRound } from "lucide-react";
import { useSettingsStore } from "@/store/useSettingsStore";

interface TopBarProps {
  meetingId: string;
  elapsed: string;
  view: "gallery" | "speaker";
  onSetView: (v: "gallery" | "speaker") => void;
  /**
   * Applies the Original Sound preference to the live mic (rebuild the audio
   * track with/without DSP). Live-only; Demo has no real stream, so it's the
   * store toggle alone (label-only there).
   */
  onOriginalSoundChange?: (on: boolean) => void;
}

export default function TopBar({ meetingId, elapsed, view, onSetView, onOriginalSoundChange }: TopBarProps) {
  const [info, setInfo] = useState(false);
  const [viewMenu, setViewMenu] = useState(false);
  const [soundMenu, setSoundMenu] = useState(false);
  const originalSound = useSettingsStore((s) => s.originalSound);
  const setOriginalSound = useSettingsStore((s) => s.setOriginalSound);

  const selectOriginalSound = (on: boolean) => {
    setOriginalSound(on);
    onOriginalSoundChange?.(on);
    setSoundMenu(false);
  };

  return (
    <div className="relative flex h-11 shrink-0 items-center justify-between bg-stage px-3 text-text-primary md:px-4">
      {/* Left: encryption shield + Original Sound dropdown */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-active-speaker" />
        <div className="relative hidden sm:block">
          <button
            onClick={() => setSoundMenu((v) => !v)}
            className="flex items-center gap-1 rounded px-1.5 py-0.5 text-sm hover:bg-hover"
          >
            Original Sound: {originalSound ? "On" : "Off"}
            <ChevronDown className="h-3.5 w-3.5 text-text-secondary" />
          </button>
          {soundMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setSoundMenu(false)} />
              <div className="absolute left-0 top-8 z-20 w-64 overflow-hidden rounded-lg bg-panel-2 py-1 text-sm shadow-lg ring-1 ring-panel-border">
                <SoundOption
                  label="Original Sound: On"
                  hint="Raw mic — no echo cancel, noise or gain processing. Best for music."
                  selected={originalSound}
                  onClick={() => selectOriginalSound(true)}
                />
                <SoundOption
                  label="Original Sound: Off"
                  hint="Suppress echo, background noise and normalize gain. Best for speech."
                  selected={!originalSound}
                  onClick={() => selectOriginalSound(false)}
                />
              </div>
            </>
          )}
        </div>
        <div className="relative">
          <button
            onClick={() => setInfo((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded hover:bg-hover"
            aria-label="Meeting info"
          >
            <Info className="h-4 w-4 text-text-secondary" />
          </button>
          {info && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setInfo(false)} />
              <div className="absolute left-0 top-8 z-20 w-56 rounded-lg bg-panel-2 p-3 text-xs shadow-lg ring-1 ring-panel-border">
                <div className="mb-1 flex justify-between">
                  <span className="text-text-secondary">Meeting ID</span>
                  <span className="tabular-nums">{meetingId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Elapsed</span>
                  <span className="tabular-nums">{elapsed}</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Fork / API-keys CTAs + View dropdown */}
      <div className="flex items-center gap-2">
        <a
          href="https://github.com/videosdk-community/zoom-clone/fork"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md bg-zoom-blue px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-zoom-blue/90 md:inline-flex"
        >
          <Github className="h-3.5 w-3.5" />
          Fork now
        </a>
        <a
          href="https://app.videosdk.live/api-keys"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium text-text-secondary transition-colors hover:bg-hover hover:text-text-primary md:inline-flex"
        >
          <KeyRound className="h-3.5 w-3.5" />
          Get API keys
        </a>
        <span className="mx-0.5 hidden h-4 w-px bg-panel-border md:inline-block" />
        <div className="relative">
          <button
            onClick={() => setViewMenu((v) => !v)}
            className="flex items-center gap-1.5 rounded-md bg-white/5 px-2.5 py-1 text-xs font-medium transition-colors hover:bg-hover"
          >
            <LayoutGrid className="h-4 w-4" />
            View
            <ChevronDown className="h-3 w-3 text-text-secondary" />
          </button>
          {viewMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setViewMenu(false)} />
              <div className="absolute right-0 top-9 z-20 w-44 overflow-hidden rounded-lg bg-panel-2 py-1 text-sm shadow-lg ring-1 ring-panel-border">
                <ViewOption
                  icon={<User className="h-4 w-4" />}
                  label="Speaker View"
                  selected={view === "speaker"}
                  onClick={() => {
                    onSetView("speaker");
                    setViewMenu(false);
                  }}
                />
                <ViewOption
                  icon={<LayoutGrid className="h-4 w-4" />}
                  label="Gallery View"
                  selected={view === "gallery"}
                  onClick={() => {
                    onSetView("gallery");
                    setViewMenu(false);
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SoundOption({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-start gap-2 px-3 py-2 text-left hover:bg-hover"
    >
      <span className="flex h-5 w-4 shrink-0 items-center justify-center">
        {selected && <Check className="h-4 w-4 text-zoom-blue" />}
      </span>
      <span className="flex-1">
        <span className="block text-text-primary">{label}</span>
        <span className="block text-xs text-text-secondary">{hint}</span>
      </span>
    </button>
  );
}

function ViewOption({
  icon,
  label,
  selected,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-2 text-left text-text-primary hover:bg-hover"
    >
      {icon}
      <span className="flex-1">{label}</span>
      {selected && <Check className="h-4 w-4 text-zoom-blue" />}
    </button>
  );
}
