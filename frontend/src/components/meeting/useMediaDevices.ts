import { useEffect, useState } from "react";

export interface MediaDeviceLists {
  cameras: MediaDeviceInfo[];
  mics: MediaDeviceInfo[];
  speakers: MediaDeviceInfo[];
}

/**
 * Enumerates the browser's media devices, refreshing on device changes.
 * Labels are populated once media permission has been granted (as it is inside
 * a meeting, or after the PreJoin preview).
 */
export function useMediaDevices(): MediaDeviceLists {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const list = await navigator.mediaDevices.enumerateDevices();
      if (!cancelled) setDevices(list);
    };
    load();
    navigator.mediaDevices.addEventListener("devicechange", load);
    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener("devicechange", load);
    };
  }, []);

  return {
    cameras: devices.filter((d) => d.kind === "videoinput"),
    mics: devices.filter((d) => d.kind === "audioinput"),
    speakers: devices.filter((d) => d.kind === "audiooutput"),
  };
}
