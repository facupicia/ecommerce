"use client";

import { ReactNode } from "react";
import { SWRConfig } from "swr";
import { fetcher } from "./fetcher";

export function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher: fetcher as any,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        dedupingInterval: 5_000,
        errorRetryCount: 2,
        keepPreviousData: true,
      }}
    >
      {children}
    </SWRConfig>
  );
}
