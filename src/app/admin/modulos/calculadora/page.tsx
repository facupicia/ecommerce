"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Save,
  Download,
  RotateCcw,
  ArrowRight,
  AlertTriangle,
  Info,
  ShoppingBag,
  Plane,
  Shield,
  DollarSign,
  Upload,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { Product, FxRates, ShipmentCosts, AduanaConfig, CalculationResult } from "@/lib/types";
import { calcularTodo, fmtUSD, fmtARS, fmtPct, uid } from "@/lib/utils";
import { CssbuyOrder } from "@/lib/types";

export default function CalculatorPage() {
  const [fx, setFx] = useState<FxRates>({ blue: 0, oficial: 0, mep: 0, cny: 7.2 });
  const [envio, setEnvio] = useState<ShipmentCosts>({
    freightCNY: 0,
    serviceCNY: 0,
    recargaPct: 0.03,
    recargaFijo: 0.3,
    platformFee: 0.35,
    markup: 2.0,
  });
  const [lineaEnvio, setLineaEnvio] = useState<string>("chinapost-sal");
  const [tarifaPorGramo, setTarifaPorGramo] = useState<number>(0);
  const [empaque, setEmpaque] = useState<"bag" | "box">("bag");
  const [cupon100, setCupon100] = useState(false);
  const [aduana, setAduana] = useState<AduanaConfig>({
    dentroFranquicia: false,
    enviosAnio: 0,
    ivaPct: 0.21,
    iibbPct: 0.03,
    valorDeclaradoUSD: null,
  });
  const [productos, setProductos] = useState<Product[]>([]);

  const [orders, setOrders] = useState<CssbuyOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [uploadMsg, setUploadMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CSSBUY_SCRAPER_SCRIPT = `// CSSBuy Warehouse Scraper — solo productos en almacén
// 1. Andá a https://www.cssbuy.com/web/order y logueate
// 2. F12 → Console → Pegá esto → Enter
// 3. Se descarga orders.json, subilo en esta página

(async()=>{
const P=50,M=500,A=[];

function peso(w){
  if(!w)return 0;
  if(typeof w==='number')return w;
  try{const p=JSON.parse(String(w));return Array.isArray(p)?(Number(p[0])||0):(Number(w)||0)}
  catch{return Number(String(w).match(/\\d+/)?.[0])||0}
}

function map(it){
  return{
    oid:String(it.oid??''),
    producto:String(it.goodsname??''),
    imagen:String(it.goodsimg??it.skuimg??''),
    url:String(it.goodsurl??''),
    vendedor:String(it.goodsseller??''),
    variante:String(it.goodssize??''),
    precio_unitario_cny:Number(it.goodsprice)||0,
    envio_local_cny:Number(it.sendprice)||0,
    envio_china_cny:Number(it.chinashipping)||0,
    cantidad:Math.max(1,Math.round(Number(it.goodsnum)||1)),
    estado:String(it.statename??it.state??''),
    peso_g:peso(it.orderweight),
    tracking:String(it.expressno??''),
    fecha_pedido:Number(it.addtime)||Math.floor(Date.now()/1000)
  }
}

let csrf='';
try{csrf=document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')||''}catch{}
if(!csrf){const m=document.documentElement.innerHTML.match(/csrf[_-]?token['"\\s:=]+['"]?([a-zA-Z0-9]+)/i);if(m)csrf=m[1]}

let pn=1,hm=true;
while(hm){
  const params=new URLSearchParams();
  params.set('orderState','all');params.set('starttime','');params.set('endtime','');
  params.set('pageSize',String(P));params.set('pageNum',String(pn));
  params.set('query','');params.set('inchina','');
  if(csrf)params.set('_token',csrf);
  const res=await fetch('https://www.cssbuy.com/web/order',{
    method:'POST',
    headers:{'Content-Type':'application/x-www-form-urlencoded; charset=UTF-8','X-Requested-With':'XMLHttpRequest','X-CSRF-Token':csrf,'X-XSRF-TOKEN':csrf,Accept:'application/json, text/javascript, */*; q=0.01'},
    body:params.toString()
  });
  const text=await res.text();
  let data;try{data=JSON.parse(text)}catch{console.error('No JSON:',text.substring(0,500));break}
  let list=data?.list??data?.orders??data?.data?.list??data?.data?.orders??data?.data?.data??data;
  if(!Array.isArray(list)){console.error('Formato:',JSON.stringify(data).substring(0,500));break}
  for(const it of list){if(it.state===4||it.statename==='In Warehouse')A.push(map(it))}
  console.log('Pág '+pn+': '+list.length+' raw, '+A.length+' warehouse');
  hm=list.length>=P&&A.length<M;
  if(hm)pn++
}
console.log('\\n✅ '+A.length+' pedidos en almacén');
const blob=new Blob([JSON.stringify({orders:A,lastSync:new Date().toISOString()},null,2)],{type:'application/json'});
const url=URL.createObjectURL(blob);
const a=document.createElement('a');a.href=url;a.download='orders.json';a.click();
URL.revokeObjectURL(url);
console.log('💾 orders.json descargado!');
console.table(A.slice(0,10).map(o=>({oid:o.oid,producto:o.producto?.substring(0,50),estado:o.estado,peso:o.peso_g,precio:o.precio_unitario_cny})))
})();`;

  const [copied, setCopied] = useState(false);
  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(CSSBUY_SCRAPER_SCRIPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("No se pudo copiar al portapapeles");
    }
  };

  // Cargar warehouse orders
  const loadOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/warehouse", { credentials: "same-origin" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error cargando warehouse");
      const items = (data.orders || []) as CssbuyOrder[];
      setOrders(items.filter((o) => o.estado === "In Warehouse"));
    } catch (e: any) {
      console.error("Error loading warehouse orders:", e);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  // Upload orders.json
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const ordersArray = Array.isArray(json) ? json : json.orders || [];
      if (ordersArray.length === 0) throw new Error("No orders found in file");

      const res = await fetch("/api/warehouse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orders: ordersArray }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Upload failed");
      const data = await res.json();
      setUploadMsg({ type: "success", text: `${data.upserted || data.count} órdenes importadas` });
      await loadOrders();
    } catch (err: any) {
      setUploadMsg({ type: "error", text: err.message });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const [nombreEnvio, setNombreEnvio] = useState("");
  const [cotizaciones, setCotizaciones] = useState<any[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("cssbuy-cotizaciones") || "[]");
    } catch {
      return [];
    }
  });

  const resultados = useMemo(() => calcularTodo(productos, fx, envio, aduana), [productos, fx, envio, aduana]);

  const pesoTotalG = productos.reduce((s, p) => s + (p.pesoG || 0) * (p.cantidad || 1), 0);

  // Empaque: bolsa no suma peso (hasta 5999g). Caja suma ~400g de cartón/protección.
  const pesoFacturadoG = useMemo(() => {
    if (empaque === "box" && pesoTotalG > 5999) {
      return pesoTotalG + 400;
    }
    return pesoTotalG;
  }, [pesoTotalG, empaque]);

  const freightCalculado = useMemo(() => {
    if (lineaEnvio === "chinapost-sal") {
      // China Post SAL 15 días - Pure Weight
      // First weight: USD 25.85 / 1000g, Added weight: USD 10.78 / 1000g
      // CSSBuy cobra por kg completo (redondeo hacia arriba)
      const firstUSD = 25.85;
      const addedUSD = 10.78;
      const totalKg = Math.ceil(pesoFacturadoG / 1000);
      const freightUSD = firstUSD + Math.max(0, totalKg - 1) * addedUSD;
      return Math.round(freightUSD * fx.cny);
    }
    return Math.round(pesoFacturadoG * tarifaPorGramo);
  }, [pesoFacturadoG, lineaEnvio, tarifaPorGramo, fx.cny]);

  // Cupón 500/100 yuanes: descuento de 100 yuanes si el freight supera 500 yuanes.
  const descuentoCuponCNY = cupon100 && freightCalculado >= 500 ? 100 : 0;
  const freightConDescuentoCNY = Math.max(0, freightCalculado - descuentoCuponCNY);

  // Sincronizar freight calculado con el estado de envío (solo líneas auto)
  useEffect(() => {
    if (lineaEnvio === "custom" || pesoTotalG === 0) return;
    setEnvio((prev) =>
      prev.freightCNY === freightConDescuentoCNY
        ? prev
        : { ...prev, freightCNY: freightConDescuentoCNY }
    );
  }, [lineaEnvio, pesoTotalG, freightConDescuentoCNY]);

  const addProducto = useCallback(() => {
    setProductos((prev) => [
      ...prev,
      {
        id: uid(),
        nombre: "",
        precioCNY: 0,
        envioLocalCNY: 0,
        envioChinaCNY: 0,
        pesoG: 0,
        cantidad: 1,
        precioVentaUSD: 0,
        link: "",
        imgURL: "",
      },
    ]);
  }, []);

  const removeProducto = useCallback((id: string) => {
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateProducto = useCallback((id: string, field: keyof Product, value: any) => {
    setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  }, []);

  const importFromOrder = useCallback(
    (order: CssbuyOrder) => {
      const exists = productos.find((p) => p.link === order.url);
      if (exists) return;
      setProductos((prev) => [
        ...prev,
        {
          id: uid(),
          nombre: order.producto || `CSSBuy #${order.oid}`,
          precioCNY: order.precio_unitario_cny || 0,
          envioLocalCNY: order.envio_local_cny || 0,
          envioChinaCNY: order.envio_china_cny || 0,
          pesoG: order.peso_g || 0,
          cantidad: order.cantidad || 1,
          precioVentaUSD: 0,
          link: order.url || "",
          imgURL: order.imagen || "",
        },
      ]);
    },
    [productos]
  );

  const guardarCotizacion = useCallback(() => {
    if (resultados.productosUSDTotal === 0) {
      alert("Agregá al menos un producto");
      return;
    }
    const cot = {
      id: uid(),
      fecha: new Date().toISOString(),
      nombre: nombreEnvio.trim() || `Cotización ${new Date().toLocaleDateString("es-AR")}`,
      fx,
      envio,
      aduana,
      productos,
      resultados,
    };
    const updated = [cot, ...cotizaciones].slice(0, 50);
    setCotizaciones(updated);
    localStorage.setItem("cssbuy-cotizaciones", JSON.stringify(updated));
    alert(`"${cot.nombre}" guardada.`);
  }, [fx, envio, aduana, productos, resultados, nombreEnvio, cotizaciones]);

  const exportarCSV = useCallback(() => {
    if (resultados.productosCalc.length === 0) {
      alert("Nada para exportar");
      return;
    }
    const nombre = nombreEnvio.trim() || "cotizacion";
    const header = [
      "Producto",
      "Cantidad",
      "Precio unit CNY",
      "Peso unit g",
      "Link",
      "Costo unit USD",
      "Venta USD",
      "Ganancia c/u USD",
      "Ganancia total USD",
    ];
    const rows = resultados.productosCalc.map((p) => [
      p.nombre,
      p.cantidad,
      p.precioCNY,
      p.pesoG,
      p.link || "",
      p.costoUnitUSD.toFixed(2),
      p.ventaUSD.toFixed(2),
      p.gananciaUnitUSD.toFixed(2),
      p.gananciaTotalUSD.toFixed(2),
    ]);
    const totales = [
      "TOTAL",
      "",
      "",
      resultados.pesoTotalG,
      "",
      "",
      resultados.costoTotalUSD.toFixed(2),
      resultados.ingresoTotalUSD.toFixed(2),
      "",
      resultados.gananciaTotalUSD.toFixed(2),
    ];
    const csv = [header, ...rows, totales]
      .map((row) =>
        row
          .map((cell) => {
            const s = String(cell).replace(/"/g, '""');
            return /[",\n]/.test(s) ? `"${s}"` : s;
          })
          .join(",")
      )
      .join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nombre.replace(/[^a-z0-9]/gi, "-").toLowerCase() + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [resultados, nombreEnvio]);

  const limpiar = useCallback(() => {
    if (!confirm("¿Limpiar todo?")) return;
    setNombreEnvio("");
    setProductos([]);
    setEnvio({ freightCNY: 0, serviceCNY: 0, recargaPct: 0.03, recargaFijo: 0.3, platformFee: 0.35, markup: 2.0 });
    setAduana({ dentroFranquicia: false, enviosAnio: 0, ivaPct: 0.21, iibbPct: 0.03, valorDeclaradoUSD: null });
  }, []);

  const actualizarDolar = async () => {
    try {
      const [oficial, blue, mep] = await Promise.all([
        fetch("https://dolarapi.com/v1/dolares/oficial").then((r) => r.json()),
        fetch("https://dolarapi.com/v1/dolares/blue").then((r) => r.json()),
        fetch("https://dolarapi.com/v1/dolares/bolsa").then((r) => r.json()),
      ]);
      setFx((prev) => ({ ...prev, oficial: oficial.venta, blue: blue.venta, mep: mep.venta }));
    } catch (e) {
      alert("Error actualizando dolar");
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload orders.json */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-100">Órdenes Warehouse</h3>
            <span className="text-xs text-zinc-500">
              {ordersLoading ? "Cargando..." : `${orders.length} productos`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadOrders}
              className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1.5 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refrescar
            </button>
            <label className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2 py-1.5 rounded-lg transition-colors cursor-pointer">
              <Upload className="w-3 h-3" /> Subir orders.json
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
        {uploadMsg && (
          <div
            className={`mt-3 p-2 rounded-lg text-xs ${
              uploadMsg.type === "success"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border border-red-500/20"
            }`}
          >
            {uploadMsg.text}
          </div>
        )}

        <div className="mt-4 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-xs font-medium text-zinc-200">Script para extraer órdenes de CSSBuy</p>
              <p className="text-[11px] text-zinc-500">Pegalo en la consola de cssbuy.com/web/order</p>
            </div>
            <button
              onClick={copyScript}
              className="flex items-center gap-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1.5 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          </div>
          <textarea
            readOnly
            value={CSSBUY_SCRAPER_SCRIPT}
            className="w-full h-32 bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-[11px] font-mono text-zinc-400 focus:outline-none resize-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Left column - Inputs */}
      <div className="xl:col-span-2 space-y-5">
        {/* Nombre del envío */}
        <div className="bg-card border border-border rounded-xl p-5">
          <label className="block text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
            Nombre del envío
          </label>
          <input
            type="text"
            value={nombreEnvio}
            onChange={(e) => setNombreEnvio(e.target.value)}
            placeholder="Ej: Lote Marzo Buzos Corteiz"
            className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>

        {/* Tipo de cambio */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Tipo de cambio</h3>
            </div>
            <button
              onClick={actualizarDolar}
              className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-md transition-colors"
            >
              ↻ Actualizar API
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Dólar blue", value: fx.blue, key: "blue" as const },
              { label: "Dólar oficial", value: fx.oficial, key: "oficial" as const },
              { label: "Dólar MEP", value: fx.mep, key: "mep" as const },
              { label: "CNY por 1 USD", value: fx.cny, key: "cny" as const },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted-foreground mb-1">{field.label}</label>
                <input
                  type="number"
                  step={field.key === "cny" ? 0.01 : 1}
                  value={field.value || ""}
                  onChange={(e) => setFx((prev) => ({ ...prev, [field.key]: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Productos */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold">Productos</h3>
            </div>
            <div className="flex items-center gap-2">
              {resultados.pesoTotalG > 0 && (
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    resultados.pesoTotalG > 5999 ? "bg-destructive/10 text-destructive" : "bg-emerald-500/10 text-emerald-400"
                  }`}
                >
                  {resultados.pesoTotalG}g / 5999g
                </span>
              )}
              <button
                onClick={addProducto}
                className="flex items-center gap-1 text-xs bg-primary text-primary-foreground px-2 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-3 h-3" /> Producto
              </button>
            </div>
          </div>

          {/* Import desde orders */}
          {orders.length > 0 && (
            <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">Importar desde pedidos CSSBuy:</p>
              <div className="flex flex-wrap gap-2">
                {orders.map((o) => (
                  <button
                    key={o.oid}
                    onClick={() => importFromOrder(o)}
                    className="flex items-center gap-1.5 text-xs bg-card border border-border hover:border-primary/50 rounded-lg px-2 py-1 transition-colors"
                    title={o.producto}
                  >
                    {o.imagen && <img src={o.imagen} alt="" className="w-5 h-5 rounded object-cover" />}
                    <span className="max-w-[120px] truncate">{o.producto.slice(0, 20)}</span>
                    <span className="text-muted-foreground">¥{o.precio_unitario_cny}</span>
                    <ArrowRight className="w-3 h-3 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-24">
                    ¥ c/u
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                    Envío ¥
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-20">
                    g c/u
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-16">
                    Cant.
                  </th>
                  <th className="text-right py-2 px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28">
                    Venta USD
                  </th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {productos.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-2">
                        {p.imgURL && (
                          <img src={p.imgURL} alt="" className="w-8 h-8 rounded object-cover bg-muted flex-shrink-0" />
                        )}
                        <input
                          type="text"
                          value={p.nombre}
                          onChange={(e) => updateProducto(p.id, "nombre", e.target.value)}
                          placeholder="Nombre..."
                          className="w-full bg-transparent border-0 p-0 text-sm focus:outline-none focus:ring-0 placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={p.precioCNY || ""}
                        onChange={(e) => updateProducto(p.id, "precioCNY", parseFloat(e.target.value) || 0)}
                        className="w-full text-right bg-secondary/30 border border-border rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="text-right">
                        {p.envioLocalCNY > 0 || p.envioChinaCNY > 0 ? (
                          <span
                            className="text-xs text-emerald-400"
                            title={`Local: ¥${p.envioLocalCNY}, China: ¥${p.envioChinaCNY}`}
                          >
                            +¥{(p.envioLocalCNY + p.envioChinaCNY).toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={p.pesoG || ""}
                        onChange={(e) => updateProducto(p.id, "pesoG", parseInt(e.target.value) || 0)}
                        className="w-full text-right bg-secondary/30 border border-border rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={p.cantidad || ""}
                        onChange={(e) => updateProducto(p.id, "cantidad", parseInt(e.target.value) || 0)}
                        className="w-full text-right bg-secondary/30 border border-border rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={p.precioVentaUSD || ""}
                        onChange={(e) => updateProducto(p.id, "precioVentaUSD", parseFloat(e.target.value) || 0)}
                        placeholder="auto"
                        className="w-full text-right bg-secondary/30 border border-border rounded px-2 py-1 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <button
                        onClick={() => removeProducto(p.id)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productos.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Sin productos. Agregá uno o importá desde pedidos CSSBuy.
              </div>
            )}
          </div>
        </div>

        {/* Envío CSSBuy */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Plane className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Envío CSSBuy</h3>
            {pesoTotalG > 0 && (
              <span className="ml-auto text-xs text-muted-foreground">
                Peso neto: <span className="text-foreground font-medium">{pesoTotalG}g</span>
                {pesoFacturadoG !== pesoTotalG && (
                  <span className="text-warning"> / facturado {pesoFacturadoG}g</span>
                )}
              </span>
            )}
          </div>

          {/* Calculador de Freight */}
          <div className="mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-xs font-medium text-primary mb-2">Calculador de Freight (auto)</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Línea de envío</label>
                <select
                  value={lineaEnvio}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLineaEnvio(val);
                    const tarifas: Record<string, number> = {
                      custom: 0,
                      "chinapost-sal": 0,
                      ems: 0.09,
                      dhl: 0.16,
                      fedex: 0.15,
                      ups: 0.14,
                      chinapost: 0.06,
                      eub: 0.08,
                    };
                    setTarifaPorGramo(tarifas[val] || 0);
                  }}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="chinapost-sal">China Post SAL 15 días (Pure Weight)</option>
                  <option value="custom">Manual (sin auto)</option>
                  <option value="ems">EMS (~0.09 ¥/g)</option>
                  <option value="dhl">DHL (~0.16 ¥/g)</option>
                  <option value="fedex">FedEx (~0.15 ¥/g)</option>
                  <option value="ups">UPS (~0.14 ¥/g)</option>
                  <option value="chinapost">China Post (~0.06 ¥/g)</option>
                  <option value="eub">EUB / ePacket (~0.08 ¥/g)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Empaque</label>
                <select
                  value={empaque}
                  onChange={(e) => setEmpaque(e.target.value as "bag" | "box")}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="bag">Bolsa / Simple Packaging</option>
                  <option value="box">Caja (+400g si pasa 5999g)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tarifa (¥/g)</label>
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  value={tarifaPorGramo || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setTarifaPorGramo(val);
                    setLineaEnvio("custom");
                  }}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Freight calculado (¥)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={envio.freightCNY || ""}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setEnvio((prev) => ({ ...prev, freightCNY: val }));
                      setLineaEnvio("custom");
                    }}
                    className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
                  />
                  {lineaEnvio !== "custom" && pesoTotalG > 0 && (
                    <span className="text-xs text-emerald-400 whitespace-nowrap">auto</span>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                id="cupon100"
                type="checkbox"
                checked={cupon100}
                onChange={(e) => setCupon100(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="cupon100" className="text-xs text-muted-foreground cursor-pointer">
                Aplicar cupón 500/100 yuanes (-¥100 si freight ≥ ¥500)
              </label>
            </div>
            {lineaEnvio === "chinapost-sal" && pesoTotalG > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {pesoFacturadoG <= 1000 ? (
                  <>
                    Primeros 1000g = <span className="text-emerald-400 font-medium">USD 25.85</span>
                  </>
                ) : (
                  <>
                    {pesoTotalG}g{pesoFacturadoG !== pesoTotalG && <> facturado como {pesoFacturadoG}g</>} redondeado a{" "}
                    {Math.ceil(pesoFacturadoG / 1000)}kg: USD 25.85 +{" "}
                    {Math.max(0, Math.ceil(pesoFacturadoG / 1000) - 1)} × USD 10.78 ={" "}
                    <span className="text-emerald-400 font-medium">¥{freightCalculado}</span>
                    {descuentoCuponCNY > 0 && (
                      <>
                        {" "}- ¥{descuentoCuponCNY} cupón ={" "}
                        <span className="text-emerald-400 font-medium">¥{freightConDescuentoCNY}</span>
                      </>
                    )}
                  </>
                )}
              </p>
            )}
            {lineaEnvio !== "custom" && lineaEnvio !== "chinapost-sal" && pesoTotalG > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {pesoTotalG}g × {tarifaPorGramo.toFixed(3)} ¥/g ={" "}
                <span className="text-emerald-400 font-medium">¥{freightCalculado}</span>
              </p>
            )}
            {pesoTotalG === 0 && lineaEnvio !== "custom" && (
              <p className="text-xs text-warning mt-2">Cargá el peso de los productos para calcular el freight.</p>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { label: "Service (¥)", value: envio.serviceCNY, key: "serviceCNY" as const, step: 0.01 },
              {
                label: "Recarga fee (%)",
                value: envio.recargaPct * 100,
                key: "recargaPct" as const,
                step: 0.01,
                transform: (v: number) => v / 100,
              },
              { label: "Recarga fijo (USD)", value: envio.recargaFijo, key: "recargaFijo" as const, step: 0.01 },
              { label: "Platform fee (USD)", value: envio.platformFee, key: "platformFee" as const, step: 0.01 },
              { label: "Markup sugerido (x)", value: envio.markup, key: "markup" as const, step: 0.1 },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-muted-foreground mb-1">{field.label}</label>
                <input
                  type="number"
                  step={field.step}
                  value={field.value || ""}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setEnvio((prev) => ({ ...prev, [field.key]: field.transform ? field.transform(val) : val }));
                  }}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Aduana Argentina */}
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold">Aduana Argentina (Régimen Courier)</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg">
              <input
                type="checkbox"
                id="franquicia"
                checked={aduana.dentroFranquicia}
                onChange={(e) => setAduana((prev) => ({ ...prev, dentroFranquicia: e.target.checked }))}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="franquicia" className="text-sm">
                Dentro de franquicia $50 (1 de tus primeros 5 envíos del año)
              </label>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Envíos del año</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={aduana.enviosAnio || ""}
                  onChange={(e) => setAduana((prev) => ({ ...prev, enviosAnio: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">IVA (%)</label>
                <input
                  type="number"
                  step={0.01}
                  value={(aduana.ivaPct * 100) || ""}
                  onChange={(e) => setAduana((prev) => ({ ...prev, ivaPct: (parseFloat(e.target.value) || 0) / 100 }))}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">IIBB (%)</label>
                <input
                  type="number"
                  step={0.01}
                  value={(aduana.iibbPct * 100) || ""}
                  onChange={(e) => setAduana((prev) => ({ ...prev, iibbPct: (parseFloat(e.target.value) || 0) / 100 }))}
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Valor declarado (USD)</label>
                <input
                  type="number"
                  step={0.01}
                  value={aduana.valorDeclaradoUSD || ""}
                  onChange={(e) =>
                    setAduana((prev) => ({ ...prev, valorDeclaradoUSD: parseFloat(e.target.value) || null }))
                  }
                  placeholder="auto"
                  className="w-full bg-secondary/50 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={guardarCotizacion}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Save className="w-4 h-4" /> Guardar cotización
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
          <button
            onClick={limpiar}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary/80 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Limpiar
          </button>
        </div>
      </div>

      {/* Right column - Results */}
      <div className="xl:col-span-1">
        <div className="sticky top-20 space-y-5">
          <ResultsPanel resultados={resultados} platformFee={envio.platformFee} />
        </div>
      </div>
      </div>
    </div>
  );
}

function ResultsPanel({ resultados, platformFee }: { resultados: CalculationResult; platformFee: number }) {
  const r = resultados;
  const dolarVenta = r.costoPaqueteARS / (r.costoPaqueteUSD || 1);
  const kgNeto = r.pesoTotalG / 1000;
  const freightPorKg = kgNeto > 0 ? (r.freightUSD + r.serviceUSD) / kgNeto : 0;

  if (r.productosCalc.length === 0 || r.productosUSDTotal === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center text-muted-foreground">
        <Info className="w-10 h-10 mx-auto mb-3 opacity-50" />
        <p>Cargá productos para ver resultados.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Alerts */}
      {r.alerts.length > 0 && (
        <div className="space-y-2">
          {r.alerts.map((a, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-3 rounded-lg text-xs ${
                a.type === "danger"
                  ? "bg-destructive/10 text-destructive border border-destructive/20"
                  : a.type === "warning"
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-primary/10 text-primary border border-primary/20"
              }`}
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{a.msg}</p>
            </div>
          ))}
        </div>
      )}

      {/* Resumen envío */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Resumen del envío</h3>
        <div className="space-y-2 text-sm">
          <Row label="Productos (FOB)" value={fmtUSD(r.productosUSDTotal)} />
          <Row label="Freight + service" value={fmtUSD(r.freightUSD + r.serviceUSD)} />
          {r.pesoTotalG > 0 && <Row label={`Freight por kg neto (${kgNeto.toFixed(2)} kg)`} value={fmtUSD(freightPorKg)} />}
          <Row
            label={`Recarga fee (${((r.recargaFee / (r.productosUSDTotal + r.freightUSD + r.serviceUSD)) * 100).toFixed(
              0
            )}%)`}
            value={fmtUSD(r.recargaFee)}
          />
          <Row label="Platform fee" value={fmtUSD(platformFee)} />
          <div className="pt-2 border-t border-border">
            <Row label="Costo del paquete" value={fmtUSD(r.costoPaqueteUSD)} bold />
          </div>
        </div>
      </div>

      {/* Aduana */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Aduana Argentina</h3>
        <div className="space-y-2 text-sm">
          <Row label="FOB real" value={fmtUSD(r.fobRealUSD)} />
          <Row label="FOB declarado" value={fmtUSD(r.fobDeclaradoUSD)} />
          {r.ahorroSubdeclaracionUSD > 0.01 && (
            <Row
              label="Ahorro subdeclaración"
              value={fmtUSD(r.ahorroSubdeclaracionUSD)}
              valueClass="text-emerald-400"
            />
          )}
          {r.detalleImpuestos.franquicia ? (
            <div className="p-2 bg-primary/10 rounded-lg text-xs text-primary">Franquicia $50 aplicada. Impuestos = $0</div>
          ) : (
            <>
              <Row label="Arancel 50%" value={fmtUSD(r.detalleImpuestos.arancel)} />
              <Row label="IVA 21%" value={fmtUSD(r.detalleImpuestos.iva)} />
              <Row label="IIBB" value={fmtUSD(r.detalleImpuestos.iibb)} />
              <Row label="Tasa estadística 3%" value={fmtUSD(r.detalleImpuestos.tasaEst)} />
              <div className="pt-2 border-t border-border">
                <Row label="Total impuestos" value={fmtUSD(r.impuestosUSD)} valueClass="text-destructive" bold />
              </div>
            </>
          )}
          <div className="pt-2 border-t border-border">
            <Row label="Costo final puesto" value={fmtUSD(r.costoTotalUSD)} bold />
          </div>
        </div>
      </div>

      {/* Por producto */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h3 className="text-sm font-semibold mb-4">Por producto</h3>
        <div className="space-y-3">
          {r.productosCalc.map((p) => (
            <div key={p.id} className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {p.imgURL && <img src={p.imgURL} alt="" className="w-6 h-6 rounded object-cover" />}
                <p className="text-xs font-medium line-clamp-1">{p.nombre || "Sin nombre"}</p>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Producto:</span>
                  <span className="tabular-nums">{fmtUSD(p.precioUnitUSD)}</span>
                </div>
                {(p.envioLocalUnitUSD > 0 || p.envioChinaUnitUSD > 0) && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Envío China:</span>
                    <span className="tabular-nums text-emerald-400">+{fmtUSD(p.envioLocalUnitUSD + p.envioChinaUnitUSD)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1 border-t border-border/50">
                  <span className="text-muted-foreground">Costo c/u:</span>
                  <span className="tabular-nums">{fmtUSD(p.costoUnitUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Venta c/u:</span>
                  <span className="tabular-nums font-medium">{fmtUSD(p.ventaUSD)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ganancia:</span>
                  <span
                    className={`tabular-nums font-medium ${
                      p.gananciaUnitUSD >= 0 ? "text-emerald-400" : "text-destructive"
                    }`}
                  >
                    {fmtUSD(p.gananciaUnitUSD)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* KPI final */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Resumen del drop</h3>
          <span
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              r.gananciaTotalUSD >= 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-destructive/10 text-destructive"
            }`}
          >
            {r.gananciaTotalUSD >= 0 ? "Rentable" : "A pérdida"}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-3">
          <Kpi label="Ingreso total" usd={r.ingresoTotalUSD} ars={r.ingresoTotalARS} />
          <Kpi label="Costo puesto" usd={r.costoTotalUSD} ars={r.costoTotalARS} />
          <div
            className={`p-3 rounded-lg ${
              r.gananciaTotalUSD >= 0
                ? "bg-emerald-500/10 border border-emerald-500/20"
                : "bg-destructive/10 border border-destructive/20"
            }`}
          >
            <p
              className={`text-xs font-medium uppercase tracking-wider mb-1 ${
                r.gananciaTotalUSD >= 0 ? "text-emerald-400" : "text-destructive"
              }`}
            >
              Ganancia neta
            </p>
            <p
              className={`text-xl font-bold tabular-nums ${
                r.gananciaTotalUSD >= 0 ? "text-emerald-400" : "text-destructive"
              }`}
            >
              {fmtUSD(r.gananciaTotalUSD)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {fmtARS(r.gananciaTotalARS)} · {fmtPct(r.margenTotalPct)}
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">Conversión ARS con dólar {dolarVenta.toFixed(2)}</p>
      </div>
    </div>
  );
}

function Row({ label, value, bold, valueClass }: { label: string; value: string; bold?: boolean; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${bold ? "font-bold text-foreground" : ""} ${valueClass || ""}`}>{value}</span>
    </div>
  );
}

function Kpi({ label, usd, ars }: { label: string; usd: number; ars: number }) {
  return (
    <div className="p-3 bg-secondary/30 rounded-lg">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
      <p className="text-lg font-bold tabular-nums">{fmtUSD(usd)}</p>
      <p className="text-xs text-muted-foreground">{fmtARS(ars)}</p>
    </div>
  );
}
