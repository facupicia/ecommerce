"use client";

import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface ProductDetailTabsProps {
  tabs: Tab[];
}

export function ProductDetailTabs({ tabs }: ProductDetailTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");

  return (
    <div>
      {/* Tab headers */}
      <div className="flex border-b border-[#d9d9d9]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`relative flex-1 pb-3 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors ${
              active === tab.id
                ? "text-[#1a1a1a]"
                : "text-[#777777] hover:text-[#1a1a1a]"
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-[#1a1a1a]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="pt-6">
        {tabs.map((tab) =>
          tab.id === active ? (
            <div
              key={tab.id}
              className="text-[14px] leading-[1.7] text-[#777777]"
            >
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
