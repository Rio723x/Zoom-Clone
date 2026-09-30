import { Check } from "lucide-react";

export interface DeviceSection {
  title: string;
  devices: MediaDeviceInfo[];
  selectedId?: string;
  fallback: string;
  onSelect: (id: string) => void;
}

/** Dropdown listing selectable devices (mic/speaker or camera), Zoom-style. */
export default function DeviceMenu({ sections }: { sections: DeviceSection[] }) {
  return (
    <div className="w-64 overflow-hidden rounded-lg bg-panel-2 py-1.5 text-sm text-text-primary shadow-xl ring-1 ring-panel-border">
      {sections.map((sec, i) => (
        <div key={sec.title}>
          {i > 0 && <div className="my-1 border-t border-panel-border" />}
          <p className="px-3 py-1 text-xs font-medium text-text-secondary">
            {sec.title}
          </p>
          {sec.devices.length === 0 ? (
            <p className="px-3 py-1.5 text-text-muted">No devices found</p>
          ) : (
            sec.devices.map((d, idx) => {
              const selected = sec.selectedId
                ? d.deviceId === sec.selectedId
                : idx === 0;
              return (
                <button
                  key={d.deviceId}
                  onClick={() => sec.onSelect(d.deviceId)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left hover:bg-hover"
                >
                  <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                    {selected && <Check className="h-4 w-4 text-zoom-blue" />}
                  </span>
                  <span className="flex-1 truncate">
                    {d.label || `${sec.fallback} ${idx + 1}`}
                  </span>
                </button>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
}
