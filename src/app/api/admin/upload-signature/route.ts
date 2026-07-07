import { type NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const ALLOWED_FOLDERS = [
  "ecommerce/banners",
  "ecommerce/category-cards",
  "ecommerce/misc",
  "ecommerce/products",
];

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { folder } = (await req.json()) as { folder?: string };
    const targetFolder =
      folder && ALLOWED_FOLDERS.includes(folder) ? folder : "ecommerce/misc";

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary no está configurado" },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const paramsToSign = { folder: targetFolder, timestamp };
    const sortedKeys = Object.keys(paramsToSign).sort();
    const toSign = sortedKeys
      .map((k) => `${k}=${(paramsToSign as Record<string, unknown>)[k]}`)
      .join("&");
    const signature = crypto
      .createHash("sha1")
      .update(toSign + apiSecret)
      .digest("hex");

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      folder: targetFolder,
      signature,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    });
  } catch (err) {
    console.error("Signature error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al firmar" },
      { status: 500 }
    );
  }
}
