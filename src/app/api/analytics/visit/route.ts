import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = request.headers.get("x-real-ip");
  if (real) return real.trim();
  return "unknown";
}

export async function POST(request: Request) {
  try {
    let body: { path?: string; referrer?: string; userAgent?: string } = {};
    try {
      body = await request.json();
    } catch {
      // allow empty body
    }

    const path = (body.path || "/").slice(0, 500);
    const referrer = (body.referrer || request.headers.get("referer") || "").slice(0, 500);
    const userAgent =
      body.userAgent || request.headers.get("user-agent") || "unknown";
    const ua = userAgent.slice(0, 500);
    const ip = getClientIp(request);
    const ipHash = createHash("sha256").update(ip).digest("hex").slice(0, 32);

    const { error } = await supabaseAdmin.from("shop_visits").insert({
      path,
      referrer,
      user_agent: ua,
      ip_hash: ipHash,
    });

    if (error) {
      console.error("[visit] insert error:", error);
      return NextResponse.json({ ok: false }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[visit] unexpected error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
