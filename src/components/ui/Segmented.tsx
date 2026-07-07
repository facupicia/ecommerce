"use client";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { forwardRef } from "react";
import { cn } from "@/lib/cn";

const SegmentedControl = ToggleGroupPrimitive.Root;

const SegmentedItem = forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <ToggleGroupPrimitive.Item
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center px-3 h-8 text-xs font-medium",
      "text-[var(--color-fg-muted)] transition-colors",
      "hover:text-[var(--color-fg)]",
      "data-[state=on]:bg-[var(--color-bg-elevated)] data-[state=on]:text-[var(--color-fg)] data-[state=on]:shadow-[var(--shadow-xs)]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-border-focus)]",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "first:rounded-l-[var(--radius-sm)] last:rounded-r-[var(--radius-sm)]",
      className
    )}
    {...props}
  />
));
SegmentedItem.displayName = "SegmentedItem";

export function Segmented({ children, ...props }: React.ComponentProps<typeof SegmentedControl>) {
  return (
    <div className="inline-flex items-center bg-[var(--color-bg-subtle)] p-0.5 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
      <SegmentedControl {...props}>{children}</SegmentedControl>
    </div>
  );
}

export { SegmentedItem as SegmentedOption };
