"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────

export interface CartItem {
  product_id: string;
  nombre: string;
  precio_ars: number;
  cantidad: number;
  imagen: string;
  slug: string;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (product_id: string) => void;
  updateQuantity: (product_id: string, cantidad: number) => void;
  clearCart: () => void;
  itemCount: number;
  total: number;
}

// ── Context ────────────────────────────────────────────

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tienda_cart";

function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full or unavailable — silently ignore
  }
}

// ── Provider ───────────────────────────────────────────

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    setItems(loadCart());
    setMounted(true);
  }, []);

  // Persist whenever items change (after hydration)
  useEffect(() => {
    if (mounted) saveCart(items);
  }, [items, mounted]);

  const addToCart = useCallback((newItem: CartItem) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product_id === newItem.product_id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          cantidad: updated[idx].cantidad + newItem.cantidad,
        };
        return updated;
      }
      return [...prev, { ...newItem }];
    });
  }, []);

  const removeFromCart = useCallback((product_id: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== product_id));
  }, []);

  const updateQuantity = useCallback(
    (product_id: string, cantidad: number) => {
      if (cantidad <= 0) {
        removeFromCart(product_id);
        return;
      }
      setItems((prev) =>
        prev.map((i) =>
          i.product_id === product_id ? { ...i, cantidad } : i
        )
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.cantidad, 0);
  const total = items.reduce((sum, i) => sum + i.precio_ars * i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>");
  }
  return ctx;
}
