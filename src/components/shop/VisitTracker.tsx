"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SESSION_KEY = "visit_session";
const SESSION_TTL_MS = 30 * 60 * 1000;

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; ts: number };
      if (Date.now() - parsed.ts < SESSION_TTL_MS) {
        parsed.ts = Date.now();
        window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
        return parsed.id;
      }
    }
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({ id, ts: Date.now() })
    );
    return id;
  } catch {
    return "";
  }
}

export function VisitTracker() {
  const pathname = usePathname();
  const sentFor = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith("/admin")) return;
    if (sentFor.current === pathname) return;
    sentFor.current = pathname;

    const controller = new AbortController();
    const sessionId = getSessionId();

    const payload = {
      path: pathname,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
    };

    fetch("/api/analytics/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, sessionId }),
      signal: controller.signal,
      keepalive: true,
    }).catch(() => {
      // Silenciar: el tracking nunca debe romper la página.
    });

    return () => controller.abort();
  }, [pathname]);

  return null;
}
