import { useEffect, useRef, useState } from "react";

/**
 * Manages a local `getUserMedia` camera preview for a `<video>` element.
 * Starts/stops with `enabled`, re-acquires when `deviceId` changes, and always
 * releases the stream on cleanup. Returns the ref to attach and an error flag
 * (camera denied/unavailable) for a graceful fallback.
 */
export function useCameraPreview(enabled: boolean, deviceId?: string) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        setError(false);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      } catch {
        if (!cancelled) setError(true);
      }
    }

    function stop() {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    if (enabled) start();
    else stop();

    return () => {
      cancelled = true;
      stop();
    };
  }, [enabled, deviceId]);

  return { videoRef, error };
}
