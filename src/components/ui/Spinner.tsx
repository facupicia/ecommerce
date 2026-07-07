import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Spinner({ size = "md", className }: SpinnerProps) {
  const sizeClass = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-6 w-6",
  }[size];

  return (
    <Loader2
      className={cn("animate-spin text-[var(--color-fg-muted)]", sizeClass, className)}
      aria-label="Cargando"
    />
  );
}
