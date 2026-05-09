"use client";

import Image from "next/image";
import { ExternalLink, ShoppingCart, X } from "lucide-react";
import { useCart } from "./CartContext";

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const outOfStock = product.stock === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
        <button
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
          onClick={onClose}
          aria-label="Close product details"
        >
          <X size={18} />
        </button>

        <div className="relative h-64 w-full bg-slate-100">
          <Image
            src={
              product.image_url || "https://placehold.co/600x400?text=No+Image"
            }
            alt={product.name}
            width={600}
            height={360}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 to-transparent" />
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-slate-950">
                {product.name}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {product.description || "No description available."}
              </p>
            </div>

            <p className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-emerald-100">
              Rs.{product.price.toLocaleString()}
            </p>
          </div>

          {product.stock !== undefined && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              {outOfStock ? (
                <span className="font-semibold text-red-600">Out of stock</span>
              ) : (
                <>
                  Available now:{" "}
                  <span className="font-semibold text-slate-900">
                    {product.stock}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {product.affiliated_url && (
              <a
                href={product.affiliated_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ExternalLink size={16} /> Visit Store
              </a>
            )}

            <button
              onClick={() => {
                if (outOfStock) return;
                addToCart(product);
                onClose();
              }}
              disabled={outOfStock}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition ${
                outOfStock
                  ? "cursor-not-allowed bg-slate-300"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <ShoppingCart size={16} />
              {outOfStock ? "Out of stock" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
