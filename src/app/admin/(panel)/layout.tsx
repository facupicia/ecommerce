"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { ToastProvider } from "@/components/ui/Toast";
import { SWRProvider } from "@/lib/swr-config";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <AdminShell>{children}</AdminShell>
      <ToastProvider />
    </SWRProvider>
  );
}
