import { forwardRef, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  prefix?: string;
  suffix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, label, hint, error, iconLeft, iconRight, prefix, suffix, id, ...props },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;
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
        <div
          className={cn(
            "relative flex items-center bg-[var(--color-bg-elevated)] border rounded-[var(--radius)]",
            "transition-colors duration-[var(--duration-fast)]",
            "focus-within:border-[var(--color-border-focus)] focus-within:ring-1 focus-within:ring-[var(--color-border-focus)]",
            error
              ? "border-[var(--color-danger)] focus-within:border-[var(--color-danger)] focus-within:ring-[var(--color-danger)]"
              : "border-[var(--color-border)]"
          )}
        >
          {prefix && (
            <span className="pl-3 text-sm text-[var(--color-fg-muted)] select-none">
              {prefix}
            </span>
          )}
          {iconLeft && (
            <span className="pl-3 text-[var(--color-fg-muted)] flex-shrink-0">
              {iconLeft}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex-1 min-w-0 bg-transparent px-3 py-2 text-sm text-[var(--color-fg)]",
              "placeholder:text-[var(--color-fg-subtle)]",
              "focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
              className
            )}
            {...props}
          />
          {iconRight && (
            <span className="pr-3 text-[var(--color-fg-muted)] flex-shrink-0">
              {iconRight}
            </span>
          )}
          {suffix && (
            <span className="pr-3 text-sm text-[var(--color-fg-muted)] select-none">
              {suffix}
            </span>
          )}
        </div>
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

Input.displayName = "Input";
