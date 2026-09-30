import type { LucideIcon } from "lucide-react";

interface ActionTileProps {
  icon: LucideIcon;
  label: string;
  color: string;
  onClick?: () => void;
}

export default function ActionTile({ icon: Icon, label, color, onClick }: ActionTileProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 rounded-xl bg-portal-card p-6 shadow-sm ring-1 ring-portal-border transition-shadow hover:shadow-md"
    >
      <span
        className="flex h-14 w-14 items-center justify-center rounded-xl"
        style={{ backgroundColor: color }}
      >
        <Icon className="h-7 w-7 text-white" strokeWidth={2} />
      </span>
      <span className="text-sm font-medium text-text-on-light">{label}</span>
    </button>
  );
}
