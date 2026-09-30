import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Permission } from "@/store/useMeetingControlsStore";

interface SecurityMenuProps {
  locked: boolean;
  waitingRoomEnabled: boolean;
  permissions: Record<Permission, boolean>;
  onToggleLock: () => void;
  onToggleWaitingRoom: () => void;
  onTogglePermission: (p: Permission) => void;
  /** Stretch to the container width (mobile More sheet) instead of the fixed
      popover width used on desktop. */
  fullWidth?: boolean;
}

const PERMISSION_LABELS: { key: Permission; label: string }[] = [
  { key: "share", label: "Share Screen" },
  { key: "chat", label: "Chat" },
  { key: "unmute", label: "Unmute Themselves" },
];

/**
 * Host Security menu (control-bar Shield popover). Panel content only --
 * positioning/backdrop are handled by ControlBar, matching the other menus.
 */
export default function SecurityMenu({
  locked,
  waitingRoomEnabled,
  permissions,
  onToggleLock,
  onToggleWaitingRoom,
  onTogglePermission,
  fullWidth = false,
}: SecurityMenuProps) {
  return (
    <div
      data-testid="security-menu"
      className={cn(
        "overflow-hidden rounded-lg bg-panel-2 py-1.5 text-sm text-text-primary shadow-xl ring-1 ring-panel-border",
        fullWidth ? "w-full" : "w-64",
      )}
    >
      <MenuRow label="Lock Meeting" checked={locked} onClick={onToggleLock} icon={<Lock className="h-4 w-4" />} />
      <MenuRow
        label="Enable Waiting Room"
        checked={waitingRoomEnabled}
        onClick={onToggleWaitingRoom}
      />

      <div className="my-1.5 border-t border-panel-border" />
      <p className="px-3 pb-1 pt-0.5 text-xs font-medium text-text-secondary">
        Allow participants to:
      </p>
      {PERMISSION_LABELS.map(({ key, label }) => (
        <MenuRow
          key={key}
          label={label}
          checked={permissions[key]}
          onClick={() => onTogglePermission(key)}
        />
      ))}
    </div>
  );
}

function MenuRow({
  label,
  checked,
  onClick,
  icon,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-hover"
    >
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
        {checked && <Check className="h-4 w-4 text-zoom-blue" />}
      </span>
      {icon && <span className="text-text-secondary">{icon}</span>}
      <span className="flex-1">{label}</span>
    </button>
  );
}
