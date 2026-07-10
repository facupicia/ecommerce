"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import useSWR from "swr";
import { fetcher, fetcherPost } from "@/lib/fetcher";
import type { ShopProduct } from "@/lib/types";
import { ENCARGO_CATEGORIAS } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { toast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/ui/ImageUploader";
import {
  ShoppingBag,
  Camera,
  ArrowLeft,
  ArrowRight,
  Check,
  Package,
} from "lucide-react";
import Link from "next/link";

const TALLES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"] as const;

type Step = "tipo" | "detalle" | "confirmar";

export default function NuevoEncargoPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/cuenta/auth");
    }
  }, [user, loading, router]);

  const [step, setStep] = useState<Step>("tipo");
  const [tipo, setTipo] = useState<"catalogo" | "personalizado" | null>(null);
  const [categoria, setCategoria] = useState("");
  const [talle, setTalle] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [productoId, setProductoId] = useState("");
  const [imagenUrl, setImagenUrl] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Productos del catálogo
  const { data: productsData, isLoading: loadingProducts } = useSWR<{
    products: ShopProduct[];
  }>(tipo === "catalogo" ? "/api/products?limit=100" : null, fetcher);

  const products = productsData?.products ?? [];

  // Filtrar productos por categoría
  const filteredProducts = categoria
    ? products.filter(
        (p) => p.categoria?.toLowerCase() === categoria.toLowerCase()
      )
    : products;

  const selectedProduct = products.find((p) => p.id === productoId);

  function formatARS(n: number) {
    return `$${n.toLocaleString("es-AR")}`;
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const body: any = {
        tipo,
        categoria,
        talle,
        cantidad,
      };

      if (tipo === "catalogo") {
        body.producto_id = productoId;
        body.precio_total = (selectedProduct?.precio_ars || 0) * cantidad;
      } else {
        body.imagen_url = imagenUrl;
        body.descripcion = descripcion;
      }

      const result = await fetcherPost<{ encargo: { id: string } }>(
        "/api/encargos",
        body
      );

      toast.success("Encargo creado");
      router.push(`/cuenta/encargos/${result.encargo.id}`);
    } catch (e: any) {
      toast.error("Error al crear encargo", {
        description: e.info?.error || e.message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        {step !== "tipo" ? (
          <button
            onClick={() =>
              setStep(step === "confirmar" ? "detalle" : "tipo")
            }
            className="p-1.5 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <Link
            href="/cuenta"
            className="p-1.5 hover:bg-[var(--color-bg-subtle)] rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        )}
        <div>
          <h1 className="text-xl font-bold">Nuevo encargo</h1>
          <p className="text-sm text-[var(--color-fg-muted)]">
            Paso {step === "tipo" ? 1 : step === "detalle" ? 2 : 3} de 3
          </p>
        </div>
      </div>

      {/* Step 1: Tipo */}
      {step === "tipo" && (
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-fg-muted)] mb-4">
            ¿Cómo querés hacer tu encargo?
          </p>

          <button
            onClick={() => {
              setTipo("catalogo");
              setStep("detalle");
            }}
            className="w-full text-left"
          >
            <Card
              padding="md"
              className="hover:border-[var(--color-border-focus)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-bg-subtle)] rounded-lg">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Del catálogo</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Elegí un producto pre-cargado
                  </p>
                </div>
              </div>
            </Card>
          </button>

          <button
            onClick={() => {
              setTipo("personalizado");
              setStep("detalle");
            }}
            className="w-full text-left"
          >
            <Card
              padding="md"
              className="hover:border-[var(--color-border-focus)] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[var(--color-bg-subtle)] rounded-lg">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium">Personalizado</p>
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Subí una foto de lo que buscás
                  </p>
                </div>
              </div>
            </Card>
          </button>
        </div>
      )}

      {/* Step 2: Detalle */}
      {step === "detalle" && (
        <div className="space-y-4">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {ENCARGO_CATEGORIAS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setCategoria(cat);
                    if (tipo === "catalogo") setProductoId("");
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    categoria === cat
                      ? "bg-[var(--color-fg)] text-[var(--color-fg-inverse)]"
                      : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Producto del catálogo */}
          {tipo === "catalogo" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Producto
              </label>
              {loadingProducts ? (
                <div className="py-4 flex justify-center">
                  <Spinner />
                </div>
              ) : !categoria ? (
                <p className="text-sm text-[var(--color-fg-muted)]">
                  Elegí una categoría primero
                </p>
              ) : filteredProducts.length === 0 ? (
                <p className="text-sm text-[var(--color-fg-muted)]">
                  No hay productos en esta categoría
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setProductoId(p.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        productoId === p.id
                          ? "border-[var(--color-fg)] bg-[var(--color-bg-subtle)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-border-focus)]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{p.nombre}</p>
                          <p className="text-xs text-[var(--color-fg-muted)]">
                            {p.marca}
                          </p>
                        </div>
                        <p className="text-sm font-semibold">
                          {formatARS(p.precio_ars)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Imagen (personalizado) */}
          {tipo === "personalizado" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Foto del producto
              </label>
              <ImageUploader
                images={imagenUrl ? [imagenUrl] : []}
                onChange={(imgs) => setImagenUrl(imgs[0] || "")}
                folder="ecommerce/encargos"
                maxFiles={1}
              />
            </div>
          )}

          {/* Talle */}
          <div>
            <label className="block text-sm font-medium mb-1.5">Talle</label>
            <div className="flex flex-wrap gap-2">
              {TALLES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTalle(t)}
                  className={`w-12 h-9 rounded-lg text-xs font-medium transition-colors ${
                    talle === t
                      ? "bg-[var(--color-fg)] text-[var(--color-fg-inverse)]"
                      : "bg-[var(--color-bg-subtle)] text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] border border-[var(--color-border)]"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Cantidad
            </label>
            <Input
              type="number"
              min={1}
              max={99}
              value={cantidad}
              onChange={(e) =>
                setCantidad(Math.max(1, parseInt(e.target.value) || 1))
              }
            />
          </div>

          {/* Descripción (personalizado) */}
          {tipo === "personalizado" && (
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Descripción (opcional)
              </label>
              <Textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Detallá lo que buscás: color, marca, modelo..."
                rows={3}
              />
            </div>
          )}

          <Button
            onClick={() => setStep("confirmar")}
            className="w-full"
            disabled={
              !categoria ||
              !talle ||
              (tipo === "catalogo" && !productoId) ||
              (tipo === "personalizado" && !imagenUrl)
            }
          >
            Continuar
            <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </div>
      )}

      {/* Step 3: Confirmar */}
      {step === "confirmar" && (
        <div className="space-y-4">
          <Card padding="md">
            <h2 className="font-semibold mb-3">Resumen del encargo</h2>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">Tipo</span>
                <span className="font-medium">
                  {tipo === "catalogo" ? "Catálogo" : "Personalizado"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">Categoría</span>
                <span className="font-medium">{categoria}</span>
              </div>
              {selectedProduct && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-fg-muted)]">Producto</span>
                  <span className="font-medium">
                    {selectedProduct.nombre}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">Talle</span>
                <span className="font-medium">{talle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-fg-muted)]">Cantidad</span>
                <span className="font-medium">{cantidad}</span>
              </div>

              {tipo === "catalogo" && selectedProduct && (
                <>
                  <div className="border-t border-[var(--color-border)] pt-2 mt-2" />
                  <div className="flex justify-between">
                    <span className="text-[var(--color-fg-muted)]">
                      Precio unitario
                    </span>
                    <span>{formatARS(selectedProduct.precio_ars)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total</span>
                    <span>
                      {formatARS(selectedProduct.precio_ars * cantidad)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-fg-muted)]">
                    <span>Seña a pagar (50%)</span>
                    <span>
                      {formatARS(
                        (selectedProduct.precio_ars * cantidad) / 2
                      )}
                    </span>
                  </div>
                </>
              )}

              {tipo === "personalizado" && (
                <div className="border-t border-[var(--color-border)] pt-2 mt-2">
                  <p className="text-xs text-[var(--color-fg-muted)]">
                    Te enviaremos el presupuesto por email. Vas a tener 24 horas
                    para aceptarlo y pagar la seña del 50%.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Términos */}
          <div className="bg-[var(--color-bg-subtle)] rounded-lg p-3 text-xs text-[var(--color-fg-muted)] space-y-1">
            <p>
              <strong>Términos y condiciones:</strong>
            </p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Seña del 50% no reembolsable una vez confirmado el pedido</li>
              <li>
                Si cancelás antes de comprar en China, se devuelve el 100% de la
                seña
              </li>
              <li>Plazo estimado de importación: 30 días + envío nacional</li>
              <li>
                Tenés 24 horas para pagar la seña después de aceptar el
                presupuesto
              </li>
            </ul>
            <Link href="/terminos" className="underline">
              Ver términos y condiciones completos
            </Link>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full"
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Creando encargo...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-1.5" />
                {tipo === "catalogo"
                  ? "Crear encargo y pagar seña"
                  : "Crear encargo"}
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
