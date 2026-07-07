import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type BadgeVariant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "accent"
  | "pending"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] border-[var(--color-border)]",
  success: "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/20",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/20",
  danger: "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/20",
  info: "bg-[var(--color-info-soft)] text-[var(--color-info)] border-[var(--color-info)]/20",
  accent: "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent-border)]",
  pending: "bg-[var(--estado-pending-bg)] text-[var(--estado-pending-fg)] border-[var(--estado-pending-bd)]",
  paid: "bg-[var(--estado-paid-bg)] text-[var(--estado-paid-fg)] border-[var(--estado-paid-bd)]",
  shipped: "bg-[var(--estado-shipped-bg)] text-[var(--estado-shipped-fg)] border-[var(--estado-shipped-bd)]",
  delivered: "bg-[var(--estado-delivered-bg)] text-[var(--estado-delivered-fg)] border-[var(--estado-delivered-bd)]",
  cancelled: "bg-[var(--estado-cancelled-bg)] text-[var(--estado-cancelled-fg)] border-[var(--estado-cancelled-bd)]",
};

const dotClasses: Record<BadgeVariant, string> = {
  neutral: "bg-[var(--color-fg-muted)]",
  success: "bg-[var(--color-success)]",
  warning: "bg-[var(--color-warning)]",
  danger: "bg-[var(--color-danger)]",
  info: "bg-[var(--color-info)]",
  accent: "bg-[var(--color-accent)]",
  pending: "bg-[var(--estado-pending-fg)]",
  paid: "bg-[var(--estado-paid-fg)]",
  shipped: "bg-[var(--estado-shipped-fg)]",
  delivered: "bg-[var(--estado-delivered-fg)]",
  cancelled: "bg-[var(--estado-cancelled-fg)]",
};

export const ESTADO_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

export const ESTADO_BADGE_MAP: Record<string, BadgeVariant> = {
  pending: "pending",
  paid: "paid",
  shipped: "shipped",
  delivered: "delivered",
  cancelled: "cancelled",
};

export function Badge({
  variant = "neutral",
  size = "sm",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium border rounded-full",
        size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full flex-shrink-0",
            dotClasses[variant]
          )}
          aria-hidden
        />
      )}
      {children}
    </span>
  );
}

export function EstadoBadge({ estado }: { estado: string }) {
  return (
    <Badge variant={ESTADO_BADGE_MAP[estado] || "neutral"} dot>
      {ESTADO_LABELS[estado] || estado}
    </Badge>
  );
}
