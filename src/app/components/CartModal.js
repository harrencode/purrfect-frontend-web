"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useCart } from "./CartContext";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function CartModal({ onClose, onCheckoutComplete }) {
  const { cart, removeFromCart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [quantities, setQuantities] = useState(
    Object.fromEntries(cart.map((item) => [item.id, item.quantity])),
  );

  const total = cart.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || item.quantity),
    0,
  );

  const updateQuantity = (id, change) => {
    setQuantities((prev) => {
      const item = cart.find((p) => p.id === id);
      const current = prev[id] ?? item?.quantity ?? 1;
      const max = item?.stock ?? Infinity;
      const next = Math.min(Math.max(current + change, 1), max);

      return { ...prev, [id]: next };
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: "Guest User",
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: quantities[item.id] || item.quantity,
          })),
        }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const data = await res.json();
      clearCart();
      onCheckoutComplete?.();
      window.open(data.whatsapp_url, "_blank");
    } catch (err) {
      alert("Failed " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Store cart
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">Your Cart</h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close cart"
          >
            <X size={18} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <ShoppingBag size={24} />
            </div>
            <p className="text-base font-semibold text-slate-900">
              Your cart is empty.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Items you add from the store will appear here.
            </p>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto px-6">
              {cart.map((item) => {
                const currentQty = quantities[item.id] ?? item.quantity;
                const max = item.stock ?? Infinity;
                const atMax = currentQty >= max;

                return (
                  <li key={item.id} className="py-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {item.name}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          In stock:{" "}
                          <span className="font-semibold text-slate-700">
                            {item.stock ?? "-"}
                          </span>
                        </p>

                        <div className="mt-3 inline-flex items-center overflow-hidden rounded-full border border-slate-200 bg-slate-50">
                          <button
                            onClick={() => {
                              if (currentQty <= 1) {
                                removeFromCart(item.id);
                              } else {
                                updateQuantity(item.id, -1);
                              }
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center text-slate-600 transition hover:bg-white hover:text-slate-950"
                            aria-label="Decrease quantity"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-9 text-center text-sm font-semibold text-slate-900">
                            {currentQty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            disabled={atMax}
                            className={`inline-flex h-8 w-8 items-center justify-center transition ${
                              atMax
                                ? "cursor-not-allowed text-slate-300"
                                : "text-slate-600 hover:bg-white hover:text-slate-950"
                            }`}
                            aria-label="Increase quantity"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-sm font-bold text-slate-900">
                          Rs.
                          {(
                            item.price * (quantities[item.id] || item.quantity)
                          ).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition hover:bg-red-50 hover:text-red-700"
                          title="Remove item"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="border-t border-slate-100 bg-slate-50 px-6 py-5">
              <div className="mb-4 flex items-center justify-between text-slate-900">
                <span className="text-sm font-semibold text-slate-600">
                  Total
                </span>
                <span className="text-xl font-bold">
                  Rs.{total.toLocaleString()}
                </span>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="flex-1 rounded-full bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {loading ? "Processing..." : "Checkout"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
