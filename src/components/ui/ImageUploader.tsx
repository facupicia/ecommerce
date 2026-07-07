"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, AlertTriangle } from "lucide-react";
import { CloudinaryImage } from "./CloudinaryImage";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  folder?: string;
  maxFiles?: number;
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 5 * 1024 * 1024;

export function ImageUploader({
  images,
  onChange,
  folder = "ecommerce/misc",
  maxFiles = 10,
}: ImageUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadOne = useCallback(
    async (file: File): Promise<string> => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        throw new Error("Formato no permitido. Usá JPG, PNG, WebP o AVIF.");
      }
      if (file.size > MAX_SIZE) {
        throw new Error("El archivo excede el límite de 5 MB.");
      }

      const sigRes = await fetch("/api/admin/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
        credentials: "same-origin",
      });
      if (!sigRes.ok) {
        const data = await sigRes.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo obtener la firma de upload");
      }
      const sig = (await sigRes.json()) as {
        cloudName: string;
        apiKey: string;
        timestamp: number;
        folder: string;
        signature: string;
        uploadUrl: string;
      };

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sig.apiKey);
      formData.append("timestamp", String(sig.timestamp));
      formData.append("signature", sig.signature);
      formData.append("folder", sig.folder);

      const upRes = await fetch(sig.uploadUrl, {
        method: "POST",
        body: formData,
      });
      const upData = (await upRes.json()) as {
        public_id?: string;
        error?: { message?: string };
      };
      if (!upRes.ok || !upData.public_id) {
        throw new Error(
          upData.error?.message || `Error al subir imagen (HTTP ${upRes.status})`
        );
      }
      return upData.public_id;
    },
    [folder]
  );

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      if (images.length + files.length > maxFiles) {
        setError(`Máximo ${maxFiles} imágenes.`);
        return;
      }

      setError(null);
      setUploading(true);
      const uploaded: string[] = [];

      try {
        for (const file of Array.from(files)) {
          const publicId = await uploadOne(file);
          uploaded.push(publicId);
        }
        onChange([...images, ...uploaded]);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Error al subir imágenes");
      } finally {
        setUploading(false);
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [images, onChange, maxFiles, uploadOne]
  );

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((src, i) => (
            <div
              key={`${src}-${i}`}
              className="relative group w-20 h-20 rounded-lg overflow-hidden border border-border"
            >
              <CloudinaryImage
                src={src}
                alt={`Imagen ${i + 1}`}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute -top-1.5 -right-1.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                aria-label="Eliminar imagen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 cursor-pointer
          transition-colors text-center
          ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-border bg-secondary/30 hover:bg-secondary/50"
          }
          ${uploading ? "pointer-events-none opacity-70" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <Upload className="w-6 h-6" />
          )}
          <p className="text-sm">
            {uploading
              ? "Subiendo imágenes..."
              : "Arrastrá imágenes aquí o hacé clic"}
          </p>
          <p className="text-xs text-muted-foreground/60">
            JPG, PNG, WebP, AVIF · Máx 5 MB · Hasta {maxFiles} imágenes
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-xs text-destructive">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
