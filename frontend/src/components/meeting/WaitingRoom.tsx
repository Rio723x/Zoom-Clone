import { useCameraPreview } from "./useCameraPreview";

interface WaitingRoomProps {
  roomId: string;
  name: string;
  onLeave: () => void;
}

/**
 * Holding screen shown to a participant who has joined a meeting that has the
 * Waiting Room enabled, until the host admits them. Shows a self camera preview.
 */
export default function WaitingRoom({ roomId, name, onLeave }: WaitingRoomProps) {
  const { videoRef, error } = useCameraPreview(true);

  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center gap-6 bg-stage px-4 text-text-primary">
      <div className="aspect-video w-full max-w-lg overflow-hidden rounded-panel bg-tile">
        {!error ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full -scale-x-100 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-text-secondary">
            Camera unavailable
          </div>
        )}
      </div>

      <div className="text-center">
        <h1 className="text-xl font-semibold">
          Please wait, the host will let you in soon.
        </h1>
        <p className="mt-2 text-sm text-text-secondary">
          {name} · Meeting ID {roomId}
        </p>
      </div>

      <button
        onClick={onLeave}
        className="rounded-md bg-leave px-6 py-2 text-sm font-medium text-white transition-colors hover:bg-leave-hover"
      >
        Leave
      </button>
    </div>
  );
}
