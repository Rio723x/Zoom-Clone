import { initials } from "@/lib/mock";
import { cn } from "@/lib/cn";

interface AvatarProps {
  name: string;
  color: string;
  size?: number;
  className?: string;
}

export default function Avatar({ name, color, size = 96, className }: AvatarProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full font-medium text-white select-none",
        className,
      )}
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </div>
  );
}
