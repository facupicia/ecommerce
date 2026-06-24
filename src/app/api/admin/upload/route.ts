import { type NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary-server";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

function isAdmin(req: NextRequest) {
  return req.cookies.get("admin_token")?.value === ADMIN_PASSWORD;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "ecommerce/misc";

    if (!file) {
      return NextResponse.json(
        { error: "No se envió ningún archivo" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usá JPG, PNG, WebP o AVIF." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo excede el límite de 5 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ secure_url: string; public_id: string }>(
      (resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder, resource_type: "image" },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve(result as { secure_url: string; public_id: string });
          }
        ).end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error("Cloudinary upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error al subir imagen" },
      { status: 500 }
    );
  }
}
