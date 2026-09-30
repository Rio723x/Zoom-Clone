import { useEffect, useRef, type CSSProperties } from "react";
import { useParticipant } from "@videosdk.live/react-sdk";

interface ParticipantVideoProps {
  participantId: string;
  containerStyle?: CSSProperties;
  videoStyle?: CSSProperties;
}

/**
 * Observer-free remote webcam player.
 *
 * The SDK's own `<VideoPlayer type="video">` wraps the video in a
 * `withAdaptiveObservers` HOC that runs an IntersectionObserver and calls
 * `stream.pause()` whenever the tile is measured as off-screen. During the
 * layout reflow that happens when a participant joins (the stage swaps between
 * mutually-exclusive JSX branches, remounting tiles), a freshly-mounted tile can
 * be transiently measured as non-intersecting, so the debounced handler pauses
 * the SFU stream — and the settle-back-to-visible doesn't reliably emit a
 * compensating intersection entry, so it never resumes and the video freezes on
 * its last frame.
 *
 * This component attaches the webcam track directly (mirroring the SDK's own
 * attach effect) with NO pause-on-offscreen observer, so on-screen remote video
 * can never spuriously freeze. It keeps the harmless half of the SDK HOC — a
 * ResizeObserver that reports the tile size back to the SFU via `setViewPort`
 * so remote resolution still adapts to tile size.
 *
 * Video track only; remote audio stays on the separate `<AudioPlayer>` in the
 * tile. Local video still renders through the SDK player (which skips the
 * observer for `isLocal`), so this is used for remote tiles.
 */
export default function ParticipantVideo({
  participantId,
  containerStyle,
  videoStyle,
}: ParticipantVideoProps) {
  const { webcamOn, webcamStream, isLocal, setViewPort } =
    useParticipant(participantId);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach the webcam track to the <video>. Re-runs when the stream identity
  // changes (device switch / republish); React runs the previous cleanup
  // (srcObject = null) before re-attaching, so no stale MediaStream lingers.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (webcamOn && webcamStream?.track) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      video.srcObject = mediaStream;
      void video.play().catch(() => {
        /* autoplay is allowed for muted video; ignore transient rejects */
      });
    } else {
      video.srcObject = null;
    }

    return () => {
      video.srcObject = null;
    };
  }, [webcamOn, webcamStream]);

  // Report tile size to the SFU so it sends an appropriately-scaled layer.
  // This is the non-pausing half of the SDK's adaptive observer.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    let frame = 0;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setViewPort(rect.width, rect.height);
      });
    });
    observer.observe(element);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [setViewPort]);

  return (
    <div
      ref={containerRef}
      className={`video-container participant-video-${participantId}`}
      style={{ height: "100%", ...containerStyle }}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={
          // Mirror local self-view, matching the SDK player and standard
          // video-app behavior. Remote video is never mirrored.
          isLocal
            ? { transform: "scaleX(-1)", WebkitTransform: "scaleX(-1)", ...videoStyle }
            : videoStyle
        }
      />
    </div>
  );
}
