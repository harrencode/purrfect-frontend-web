"use client";

import { useEffect, useState } from "react";
import { History, Loader2, ShoppingBag, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function OrderHistoryModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/cart/recent`);
        if (!res.ok)
          throw new Error(`HTTP ${res.status} - Failed to fetch orders`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else if (data && typeof data === "object") {
          setOrders([data]);
        } else {
          setOrders([]);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load order history.");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex max-h-[86vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              Store activity
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-xl font-bold text-slate-950">
              <History size={20} /> Recent Orders
            </h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close order history"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm font-medium text-slate-500">
              <Loader2 className="animate-spin" size={18} /> Loading orders...
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 text-orange-500">
                <ShoppingBag size={24} />
              </div>
              <p className="text-base font-semibold text-slate-900">
                No recent orders
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Your order history will appear here after checkout.
              </p>
              <a
                href="/store"
                className="mt-5 inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Browse the store
              </a>
            </div>
          ) : (
            <ul className="space-y-3">
              {orders.map((order) => (
                <li
                  key={order.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/30"
                >
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        Order #{order.id?.slice(0, 8) || "N/A"}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {order.date
                          ? new Date(order.date).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
                      Rs.
                      {Number(
                        order.total || order.total_amount || 0,
                      ).toLocaleString()}
                    </span>
                  </div>

                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <div className="space-y-1 text-sm text-slate-600">
                      {order.items.map((i, idx) => (
                        <div
                          key={i.product_id || idx}
                          className="flex justify-between gap-4"
                        >
                          <span className="min-w-0 truncate">
                            {i.name || i.product_name || "Unnamed item"}
                          </span>
                          <span className="shrink-0 font-semibold text-slate-700">
                            x{i.quantity ?? 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-500">
                      No items listed
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
