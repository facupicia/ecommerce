import Link from "next/link";
import { getShopSettings } from "@/lib/settings";

export async function AnnouncementBar() {
  const settings = await getShopSettings();

  if (!settings.announcementEnabled || !settings.announcement) {
    return null;
  }

  const content = (
    <p className="text-[11px] sm:text-[12px] font-medium text-white/90 truncate max-w-full">
      {settings.announcement}
    </p>
  );

  const bar = (
    <div className="w-full bg-black overflow-hidden">
      <div className="flex items-center justify-center h-9 px-4">
        <div className="animate-[marquee_20s_linear_infinite] whitespace-nowrap flex gap-8">
          {content}
          <span className="inline-block w-2 h-1.5 rounded-full bg-white/30 flex-shrink-0 self-center" />
          {content}
          <span className="inline-block w-2 h-1.5 rounded-full bg-white/30 flex-shrink-0 self-center" />
          {content}
        </div>
      </div>
    </div>
  );

  if (settings.announcementLink) {
    return (
      <Link href={settings.announcementLink} className="block">
        {bar}
      </Link>
    );
  }

  return bar;
}

// Inject keyframes once via a style tag rendered anywhere
export const announcementStyles = `
@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-33.333%); }
}
`;
