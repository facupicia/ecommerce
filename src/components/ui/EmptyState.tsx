import { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-6",
        className
      )}
    >
      <div className="mb-4 text-[var(--color-fg-subtle)] opacity-60">
        {icon || <Inbox className="h-10 w-10" strokeWidth={1.2} />}
      </div>
      <h3 className="text-sm font-semibold text-[var(--color-fg)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--color-fg-muted)] max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
