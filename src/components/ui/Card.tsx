import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outline" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  interactive?: boolean;
}

const variantClasses = {
  default:
    "bg-[var(--color-bg-elevated)] border border-[var(--color-border)]",
  elevated:
    "bg-[var(--color-bg-elevated)] border border-[var(--color-border)] shadow-[var(--shadow-sm)]",
  outline:
    "bg-transparent border border-[var(--color-border)]",
  ghost:
    "bg-[var(--color-bg-subtle)] border border-transparent",
};

const paddingClasses = {
  none: "",
  sm: "p-3",
  md: "p-5",
  lg: "p-6",
};

export function Card({
  className,
  variant = "default",
  padding = "md",
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] transition-colors duration-[var(--duration-fast)]",
        variantClasses[variant],
        paddingClasses[padding],
        interactive &&
          "cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-sm)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3 pb-4 border-b border-[var(--color-border)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-sm font-semibold text-[var(--color-fg)]", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs text-[var(--color-fg-muted)] mt-0.5", className)}
      {...props}
    >
      {children}
    </p>
  );
}
