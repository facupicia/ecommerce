const CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
  process.env.CLOUDINARY_CLOUD_NAME;

export function isCloudinarySource(src?: string): boolean {
  if (!src) return false;
  if (src.startsWith("http")) {
    return src.includes("res.cloudinary.com");
  }
  // Asumimos public_id si no es URL
  return src.includes("/");
}

export interface CloudinaryUrlOptions {
  width?: number;
  height?: number;
  crop?: "fill" | "fit" | "limit" | "scale" | "thumb" | string;
  quality?: number | "auto";
  format?: "auto" | string;
}

export function getCloudinaryUrl(
  src: string,
  options: CloudinaryUrlOptions = {}
): string {
  if (!src) return "";
  if (!isCloudinarySource(src)) return src;

  let publicId = src;
  if (src.startsWith("http")) {
    const extracted = extractPublicId(src);
    if (extracted) publicId = extracted;
  }

  const tx: string[] = [];
  if (options.width) tx.push(`w_${options.width}`);
  if (options.height) tx.push(`h_${options.height}`);
  if (options.crop) tx.push(`c_${options.crop}`);
  tx.push(`f_${options.format ?? "auto"}`);
  tx.push(`q_${options.quality ?? "auto"}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${tx.join(",")}/${publicId}`;
}

export function extractPublicId(url: string): string | null {
  try {
    const match = url.match(/\/image\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}
