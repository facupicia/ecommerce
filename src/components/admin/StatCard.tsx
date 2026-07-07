import { ReactNode } from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delta?: { value: number; label?: string };
  hint?: string;
  className?: string;
  size?: "default" | "lg" | "sm";
}

export function StatCard({
  label,
  value,
  icon,
  delta,
  hint,
  className,
  size = "default",
}: StatCardProps) {
  const sizeClasses = {
    sm: "p-3",
    default: "p-5",
    lg: "p-6",
  }[size];

  const valueClasses = {
    sm: "text-xl",
    default: "text-3xl",
    lg: "text-4xl",
  }[size];

  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)]",
        sizeClasses,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-widest)] text-[var(--color-fg-subtle)]">
            {label}
          </p>
          <p
            className={cn(
              "font-semibold tracking-[-0.02em] text-[var(--color-fg)] mt-1.5 tabular-nums",
              valueClasses
            )}
          >
            {value}
          </p>
          {(delta || hint) && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
              {delta && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 font-medium",
                    delta.value > 0 && "text-[var(--color-success)]",
                    delta.value < 0 && "text-[var(--color-danger)]",
                    delta.value === 0 && "text-[var(--color-fg-muted)]"
                  )}
                >
                  {delta.value > 0 ? (
                    <ArrowUp className="h-2.5 w-2.5" />
                  ) : delta.value < 0 ? (
                    <ArrowDown className="h-2.5 w-2.5" />
                  ) : (
                    <Minus className="h-2.5 w-2.5" />
                  )}
                  {Math.abs(delta.value).toFixed(1)}%
                  {delta.label && <span className="text-[var(--color-fg-muted)] ml-1 font-normal">{delta.label}</span>}
                </span>
              )}
              {!delta && hint && (
                <span className="text-[var(--color-fg-muted)]">{hint}</span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-[var(--radius)] bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
