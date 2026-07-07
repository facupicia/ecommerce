import { forwardRef, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[var(--color-fg-muted)] tracking-[var(--tracking-wide)] uppercase"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            "w-full bg-[var(--color-bg-elevated)] border rounded-[var(--radius)] px-3 py-2 text-sm text-[var(--color-fg)]",
            "placeholder:text-[var(--color-fg-subtle)] resize-y",
            "transition-colors duration-[var(--duration-fast)]",
            "focus:outline-none focus:border-[var(--color-border-focus)] focus:ring-1 focus:ring-[var(--color-border-focus)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            error
              ? "border-[var(--color-danger)]"
              : "border-[var(--color-border)]",
            className
          )}
          {...props}
        />
        {(hint || error) && (
          <p
            className={cn(
              "text-xs",
              error ? "text-[var(--color-danger)]" : "text-[var(--color-fg-muted)]"
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
