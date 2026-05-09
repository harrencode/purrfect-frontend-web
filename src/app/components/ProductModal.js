"use client";

import Image from "next/image";
import {
  ExternalLink,
  PackageCheck,
  PackageX,
  ShoppingCart,
  Store,
  X,
} from "lucide-react";
import { useCart } from "./CartContext";

export default function ProductModal({ product, onClose, onAddedToCart }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock === 0;
  const lowStock =
    !outOfStock && Number.isFinite(product.stock) && product.stock <= 5;
  const stockLabel = outOfStock
    ? "Out of stock"
    : lowStock
      ? "Low stock"
      : "In stock";
  const formattedPrice = `Rs.${product.price?.toLocaleString?.() ?? product.price}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative flex h-[min(92vh,720px)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
        <button
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={18} />
        </button>

        <div className="relative h-44 w-full shrink-0 bg-slate-100 sm:h-56 md:h-64">
          <Image
            src={
              product.image_url || "https://placehold.co/600x400?text=No+Image"
            }
            alt={product.name}
            width={800}
            height={420}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/65 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">
                Product details
              </p>
              <h2 className="mt-1 line-clamp-2 text-xl font-bold leading-tight text-white drop-shadow-sm sm:text-2xl">
                {product.name}
              </h2>
            </div>
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm ${
                outOfStock
                  ? "bg-red-600 text-white"
                  : lowStock
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
              }`}
            >
              {outOfStock ? <PackageX size={14} /> : <PackageCheck size={14} />}
              {stockLabel}
            </span>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                Price
              </p>
              <p className="mt-1 text-xl font-bold text-slate-950 sm:text-2xl">
                {formattedPrice}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Availability
              </p>
              <p
                className={`mt-1 text-xl font-bold sm:text-2xl ${
                  outOfStock ? "text-red-600" : "text-slate-950"
                }`}
              >
                {product.stock ?? "-"}
              </p>
            </div>
          </div>

          <div className="mt-5 min-h-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
              Description
            </p>
            <p className="mt-2 max-h-full overflow-y-auto pr-2 text-sm leading-6 text-slate-600">
              {product.description || "No description available."}
            </p>
          </div>

          <div className="mt-4 flex shrink-0 flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            {product.affiliated_url && (
              <a
                href={product.affiliated_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink size={16} /> Visit Store
              </a>
            )}

            <button
              onClick={() => {
                if (outOfStock) return;
                addToCart(product);
                onClose();
                onAddedToCart?.(product.name);
              }}
              disabled={outOfStock}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                outOfStock
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {outOfStock ? <Store size={16} /> : <ShoppingCart size={16} />}
              {outOfStock ? "Out of stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
