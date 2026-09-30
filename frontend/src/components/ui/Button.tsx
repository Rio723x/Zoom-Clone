import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-zoom-blue hover:bg-zoom-blue-hover active:bg-zoom-blue-pressed text-white",
  secondary:
    "bg-white border border-portal-border text-text-on-light hover:bg-portal-bg",
  ghost: "bg-transparent text-zoom-blue hover:bg-zoom-blue/10",
  danger: "bg-leave hover:bg-leave-hover text-white",
};

export default function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
