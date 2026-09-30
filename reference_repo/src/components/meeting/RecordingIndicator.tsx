/**
 * Small fixed "Recording" pill shown while a recording is active, so the state
 * stays visible after you look away from the control-bar Record button.
 */
export default function RecordingIndicator({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute left-1/2 top-3 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full bg-leave/90 px-3 py-1 text-xs font-medium text-white shadow-lg">
      <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
      Recording
    </div>
  );
}
