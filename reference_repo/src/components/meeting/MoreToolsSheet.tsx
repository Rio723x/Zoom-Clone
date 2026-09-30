import { Presentation, PictureInPicture2 } from "lucide-react";
import BottomSheet from "@/components/ui/BottomSheet";
import ControlBarButton from "./ControlBarButton";
import ReactionsFlyout from "@/components/panels/ReactionsFlyout";
import SecurityMenu from "./SecurityMenu";
import {
  ZParticipants,
  ZChat,
  ZShareScreen,
  ZPolling,
  ZRecord,
} from "@/components/icons/ZoomIcons";
import type { Permission } from "@/store/useMeetingControlsStore";
import type { PanelType } from "./types";

interface MoreToolsSheetProps {
  open: boolean;
  onClose: () => void;
  isHost: boolean;
  participantCount: number;
  activePanel: PanelType;
  chatBlocked: boolean;
  shareBlocked: boolean;
  onOpenPanel: (panel: PanelType) => void;
  onShareScreen?: () => void;
  onWhiteboard?: () => void;
  onTogglePip?: () => void;
  pipActive?: boolean;
  pipSupported?: boolean;
  onToggleRecording?: () => void;
  recordingActive?: boolean;
  recordingBusy?: boolean;
  onReact?: (emoji: string) => void;
  onRaiseHand?: () => void;
  controls?: {
    locked: boolean;
    waitingRoomEnabled: boolean;
    permissions: Record<Permission, boolean>;
  };
  onToggleLock?: () => void;
  onToggleWaitingRoom?: () => void;
  onTogglePermission?: (p: Permission) => void;
}

/**
 * Mobile "More" bottom sheet: the meeting features that don't fit the collapsed
 * control bar. Feature tiles reuse `ControlBarButton`; Reactions and Security
 * reuse their existing self-contained menus inline. Opening a panel dismisses
 * the sheet first so the panel isn't hidden behind it.
 */
export default function MoreToolsSheet({
  open,
  onClose,
  isHost,
  participantCount,
  activePanel,
  chatBlocked,
  shareBlocked,
  onOpenPanel,
  onShareScreen,
  onWhiteboard,
  onTogglePip,
  pipActive,
  pipSupported,
  onToggleRecording,
  recordingActive,
  recordingBusy,
  onReact,
  onRaiseHand,
  controls,
  onToggleLock,
  onToggleWaitingRoom,
  onTogglePermission,
}: MoreToolsSheetProps) {
  const openPanel = (panel: PanelType) => {
    onClose();
    onOpenPanel(panel);
  };
  const run = (fn?: () => void) => {
    onClose();
    fn?.();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="More">
      <div className="grid grid-cols-3 gap-2 p-3">
        <Tile>
          <ControlBarButton
            icon={ZParticipants}
            label="Participants"
            badge={participantCount}
            active={activePanel === "participants"}
            onClick={() => openPanel("participants")}
          />
        </Tile>
        <Tile>
          <ControlBarButton
            icon={ZChat}
            label="Chat"
            active={activePanel === "chat"}
            disabled={chatBlocked}
            title={chatBlocked ? "The host has disabled chat for participants" : undefined}
            onClick={() => !chatBlocked && openPanel("chat")}
          />
        </Tile>
        <Tile>
          <ControlBarButton
            icon={ZPolling}
            label="Polling"
            active={activePanel === "polls"}
            onClick={() => openPanel("polls")}
          />
        </Tile>
        <Tile>
          <ControlBarButton
            icon={ZShareScreen}
            label="Share Screen"
            green
            disabled={shareBlocked}
            title={
              shareBlocked
                ? "The host has disabled screen sharing for participants"
                : undefined
            }
            onClick={() => !shareBlocked && run(onShareScreen)}
          />
        </Tile>
        <Tile>
          <ControlBarButton
            icon={Presentation}
            label="Whiteboard"
            onClick={() => run(onWhiteboard)}
          />
        </Tile>
        {pipSupported && (
          <Tile>
            <ControlBarButton
              icon={PictureInPicture2}
              label="Picture in Picture"
              active={pipActive}
              onClick={() => run(onTogglePip)}
            />
          </Tile>
        )}
        {isHost && (
          <Tile>
            <ControlBarButton
              icon={ZRecord}
              label={recordingActive ? "Stop" : "Record"}
              danger={recordingActive}
              disabled={recordingBusy}
              title={recordingBusy ? "Recording is starting/stopping..." : undefined}
              onClick={() => run(onToggleRecording)}
            />
          </Tile>
        )}
      </div>

      {/* Reactions — reuse the self-contained flyout inline. */}
      <div className="border-t border-panel-border px-3 py-3">
        <p className="pb-2 text-xs font-medium text-text-secondary">Reactions</p>
        <ReactionsFlyout
          fullWidth
          onReact={(emoji) => {
            onClose();
            onReact?.(emoji);
          }}
          onRaiseHand={() => {
            onClose();
            onRaiseHand?.();
          }}
        />
      </div>

      {/* Security — host only, reuse the self-contained menu inline. */}
      {isHost && controls && (
        <div className="border-t border-panel-border px-3 py-3">
          <p className="pb-2 text-xs font-medium text-text-secondary">Security</p>
          <SecurityMenu
            fullWidth
            locked={controls.locked}
            waitingRoomEnabled={controls.waitingRoomEnabled}
            permissions={controls.permissions}
            onToggleLock={() => onToggleLock?.()}
            onToggleWaitingRoom={() => onToggleWaitingRoom?.()}
            onTogglePermission={(p) => onTogglePermission?.(p)}
          />
        </div>
      )}
    </BottomSheet>
  );
}

/** Centers a control-bar tile within its grid cell. */
function Tile({ children }: { children: React.ReactNode }) {
  return <div className="flex justify-center">{children}</div>;
}
