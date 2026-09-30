import { useState } from "react";
import { Mic, MicOff, Video, VideoOff } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { useUserStore } from "@/store/useUserStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useCameraPreview } from "./useCameraPreview";

interface PreJoinProps {
  onJoin: (opts: { micOn: boolean; webcamOn: boolean; name: string }) => void | Promise<void>;
}

export default function PreJoin({ onJoin }: PreJoinProps) {
  const { displayName, setDisplayName } = useUserStore();
  const cameraId = useSettingsStore((s) => s.cameraId);
  const [name, setName] = useState(displayName || "");
  const [micOn, setMicOn] = useState(true);
  const [webcamOn, setWebcamOn] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const { videoRef, error: camError } = useCameraPreview(webcamOn, cameraId);

  const canJoin = name.trim().length > 0 && !joining;

  const handleJoin = async () => {
    setDisplayName(name.trim());
    setJoinError(null);
    setJoining(true);
    try {
      await onJoin({ micOn, webcamOn, name: name.trim() });
      // On success the meeting mounts and this component unmounts, so there is
      // no need to reset `joining`.
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Unable to join the meeting.");
      setJoining(false);
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-stage px-4">
      <div className="relative aspect-video w-full max-w-2xl overflow-hidden rounded-panel bg-tile">
        {webcamOn && !camError ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            // Mirror the local preview like Zoom.
            className="h-full w-full -scale-x-100 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Avatar name={name || "You"} color="#3b6ea5" size={120} />
          </div>
        )}

        {/* Preview device toggles */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-3">
          <ToggleButton
            on={micOn}
            OnIcon={Mic}
            OffIcon={MicOff}
            onClick={() => setMicOn((v) => !v)}
          />
          <ToggleButton
            on={webcamOn}
            OnIcon={Video}
            OffIcon={VideoOff}
            onClick={() => setWebcamOn((v) => !v)}
          />
        </div>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your Name"
          className="w-full rounded-lg border border-panel-border bg-tile px-4 py-2.5 text-center text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-zoom-blue"
        />
        <Button
          className="w-full py-2.5"
          disabled={!canJoin}
          onClick={handleJoin}
        >
          {joining ? "Joining…" : "Join"}
        </Button>
        {joinError && (
          <p className="text-center text-sm text-leave" role="alert">
            {joinError}
          </p>
        )}
      </div>
    </div>
  );
}

function ToggleButton({
  on,
  OnIcon,
  OffIcon,
  onClick,
}: {
  on: boolean;
  OnIcon: typeof Mic;
  OffIcon: typeof Mic;
  onClick: () => void;
}) {
  const Icon = on ? OnIcon : OffIcon;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
        on ? "bg-white/15 text-white hover:bg-white/25" : "bg-leave text-white hover:bg-leave-hover",
      )}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
