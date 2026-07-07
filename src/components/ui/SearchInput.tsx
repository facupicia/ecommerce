"use client";

import { useEffect, useState } from "react";
import { useDebounce } from "@/lib/hooks";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
  debounceMs = 250,
  className,
  autoFocus,
}: SearchInputProps) {
  const [draft, setDraft] = useState(value);
  const debounced = useDebounce(draft, debounceMs);

  useEffect(() => {
    if (debounced !== value) onChange(debounced);
  }, [debounced, onChange, value]);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <div
      className={cn(
        "relative flex items-center bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-[var(--radius)]",
        "focus-within:border-[var(--color-border-focus)] focus-within:ring-1 focus-within:ring-[var(--color-border-focus)]",
        "transition-colors",
        className
      )}
    >
      <Search className="absolute left-3 h-3.5 w-3.5 text-[var(--color-fg-muted)] pointer-events-none" />
      <input
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full bg-transparent pl-9 pr-9 py-2 text-sm text-[var(--color-fg)] placeholder:text-[var(--color-fg-subtle)] focus:outline-none"
      />
      {draft && (
        <button
          type="button"
          onClick={() => {
            setDraft("");
            onChange("");
          }}
          className="absolute right-2 p-1 text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] rounded transition-colors"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
