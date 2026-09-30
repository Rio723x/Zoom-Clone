import { ZOOM_ICON_SVGS, type ZoomIconName } from "./zoomIconData";
import { cn } from "@/lib/cn";

/**
 * Renders an exact Zoom control-bar icon extracted from Figma. Colors are
 * `currentColor`, so the button's text color (white / red / green) drives it.
 */
export function ZoomIcon({
  name,
  className,
}: {
  name: ZoomIconName;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      dangerouslySetInnerHTML={{ __html: ZOOM_ICON_SVGS[name] }}
    />
  );
}

/** Build a `{ className }` icon component for a given Zoom icon name. */
function make(name: ZoomIconName) {
  return function Icon({ className }: { className?: string }) {
    return <ZoomIcon name={name} className={className} />;
  };
}

export const ZMute = make("mute");
export const ZUnmute = make("unmute");
export const ZStartVideo = make("startVideo");
export const ZStopVideo = make("stopVideo");
export const ZSecurity = make("security");
export const ZParticipants = make("participants");
export const ZChat = make("chat");
export const ZShareScreen = make("shareScreen");
export const ZPolling = make("polling");
export const ZRecord = make("record");
export const ZReaction = make("reaction");
