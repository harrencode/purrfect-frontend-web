"use client";

import { useEffect, useState } from "react";
import ProductModal from "./ProductModal";
import Image from "next/image";
import { Eye, PackageCheck, PackageX, ShoppingBag } from "lucide-react";
import SectionHeading from "./SectionHeading";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ItemCard({
  onInitialLoadComplete,
  onAddedToCart,
  refreshKey = 0,
}) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`${API_BASE}/products/`);
        if (!res.ok) {
          throw new Error(`Failed to fetch products: ${res.status}`);
        }

        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Product fetch error:", err);
        setError("Could not load products. Please try again later.");
        setItems([]);
      } finally {
        setLoading(false);
        if (typeof onInitialLoadComplete === "function") {
          onInitialLoadComplete();
        }
      }
    };

    fetchProducts();
  }, [onInitialLoadComplete, refreshKey]);

  const formatPrice = (price) => `Rs.${price?.toLocaleString?.() ?? price}`;

  return (
    <section className="bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200 px-4 py-8">
      <SectionHeading
        eyebrow="Store catalog"
        title="Our Products"
        description="Browse essentials and accessories currently available in the shop."
      />

      {/* Loading / error / empty states */}
      {loading && items.length === 0 && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-lg border border-white/70 bg-white shadow-sm"
            >
              <div className="h-52 animate-pulse bg-slate-200" />
              <div className="space-y-4 p-5">
                <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="h-6 w-20 animate-pulse rounded bg-emerald-100" />
                  <div className="h-9 w-24 animate-pulse rounded-full bg-slate-200" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mx-auto max-w-xl rounded-lg border border-red-100 bg-red-50 px-5 py-4 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="mx-auto mb-4 w-full max-w-xl rounded-2xl border border-yellow-200 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">
            Store is getting restocked
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Please check back soon for new items.
          </p>
        </div>
      )}

      {/* Product grid */}
      {items.length > 0 && (
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const outOfStock = item.stock === 0;
            const lowStock =
              !outOfStock && Number.isFinite(item.stock) && item.stock <= 5;

            return (
              <article
                key={item.id}
                className={`group relative flex min-h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-white/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-100 hover:shadow-xl ${
                  outOfStock ? "opacity-75" : ""
                }`}
                onClick={() => setSelected(item)}
              >
                <div className="relative h-52 overflow-hidden bg-slate-100">
                  <Image
                    src={
                      item.image_url ||
                      "https://placehold.co/400x400?text=No+Image"
                    }
                    alt={item.name}
                    width={400}
                    height={208}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/45 to-transparent" />
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${
                      outOfStock
                        ? "bg-red-600 text-white"
                        : lowStock
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {outOfStock ? (
                      <PackageX size={13} />
                    ) : (
                      <PackageCheck size={13} />
                    )}
                    {outOfStock
                      ? "Out of stock"
                      : lowStock
                        ? "Low stock"
                        : "In stock"}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex flex-1 flex-col">
                    <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-950">
                      {item.name}
                    </h3>
                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
                      {item.description || "No description available."}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Price
                      </p>
                      <p className="text-lg font-bold text-slate-950">
                        {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500">
                        Stock
                      </p>
                      <p
                        className={`text-sm font-semibold ${
                          outOfStock ? "text-red-600" : "text-slate-800"
                        }`}
                      >
                        {item.stock ?? "-"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={outOfStock}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!outOfStock) setSelected(item);
                    }}
                    className={`mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition ${
                      outOfStock
                        ? "cursor-not-allowed bg-slate-200 text-slate-500"
                        : "bg-slate-950 text-white hover:bg-emerald-700"
                    }`}
                  >
                    {outOfStock ? <ShoppingBag size={16} /> : <Eye size={16} />}
                    {outOfStock ? "Unavailable" : "View Details"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
          onAddedToCart={onAddedToCart}
        />
      )}
    </section>
  );
}
