"use client";

import { useEffect, useState } from "react";
import ProductModal from "./ProductModal";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function ItemCard({ onInitialLoadComplete }) {
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
  }, [onInitialLoadComplete]);

  return (
    <section className="py-8 px-4 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Our Products
      </h2>

      {/* Loading / error / empty states */}
      {loading && items.length === 0 && (
        <p className="text-center text-gray-600 mb-4">
          Loading products...
        </p>
      )}

      {!loading && error && (
        <p className="text-center text-red-600 mb-4">{error}</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const outOfStock = item.stock === 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer relative ${
                  outOfStock ? "opacity-70" : ""
                }`}
                onClick={() => setSelected(item)}
              >
                {outOfStock && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded">
                    Out of stock
                  </span>
                )}

                <Image
                  src={
                    item.image_url ||
                    "https://placehold.co/400x400?text=No+Image"
                  }
                  alt={item.name}
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Rs.{item.price?.toLocaleString?.() ?? item.price}
                  </p>

                  {outOfStock ? (
                    <p className="mt-1 text-xs font-semibold text-red-600">
                      Out of stock
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-black">
                      In stock:{" "}
                      <span className="font-medium">{item.stock}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selected && (
        <ProductModal
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}
