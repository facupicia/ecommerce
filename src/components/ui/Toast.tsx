"use client";

import { ReactNode } from "react";
import { Toaster, toast as hotToast } from "react-hot-toast";
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "success" | "error" | "warning" | "info";

interface ToastOptions {
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const variantStyles: Record<Variant, string> = {
  success: "toast-success",
  error: "toast-error",
  warning: "toast-warning",
  info: "toast-info",
};

const variantIcons: Record<Variant, ReactNode> = {
  success: <CheckCircle2 className="h-4 w-4 text-[var(--color-success)] flex-shrink-0" />,
  error: <XCircle className="h-4 w-4 text-[var(--color-danger)] flex-shrink-0" />,
  warning: <AlertTriangle className="h-4 w-4 text-[var(--color-warning)] flex-shrink-0" />,
  info: <Info className="h-4 w-4 text-[var(--color-info)] flex-shrink-0" />,
};

function showToast(variant: Variant, title: string, options?: ToastOptions) {
  hotToast.custom(
    (t) => (
      <div
        className={cn(
          "toast-root",
          variantStyles[variant],
          t.visible ? "animate-in" : "animate-out"
        )}
        role="status"
      >
        {variantIcons[variant]}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-[var(--color-fg)]">{title}</p>
          {options?.description && (
            <p className="text-xs text-[var(--color-fg-muted)] mt-0.5">
              {options.description}
            </p>
          )}
        </div>
        {options?.action && (
          <button
            onClick={() => {
              options.action!.onClick();
              hotToast.dismiss(t.id);
            }}
            className="text-xs font-medium text-[var(--color-accent)] hover:underline flex-shrink-0"
          >
            {options.action.label}
          </button>
        )}
        <button
          onClick={() => hotToast.dismiss(t.id)}
          className="text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] flex-shrink-0"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ),
    {
      duration: options?.duration ?? 4000,
      position: "top-right",
    }
  );
}

export const toast = {
  success: (title: string, options?: ToastOptions) => showToast("success", title, options),
  error: (title: string, options?: ToastOptions) => showToast("error", title, options),
  warning: (title: string, options?: ToastOptions) => showToast("warning", title, options),
  info: (title: string, options?: ToastOptions) => showToast("info", title, options),
  dismiss: () => hotToast.dismiss(),
};

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      containerStyle={{
        top: 16,
        right: 16,
        zIndex: 9999,
      }}
      toastOptions={{
        style: {
          padding: 0,
          background: "transparent",
          boxShadow: "none",
        },
      }}
    />
  );
}
