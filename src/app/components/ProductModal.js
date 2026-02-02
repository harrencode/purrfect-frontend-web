'use client'

import { useCart } from "./CartContext"
import Image from "next/image";

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useCart()
  const outOfStock = product.stock === 0

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg relative">
        <button
          className="absolute top-2 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <Image
          src={product.image_url || "https://placehold.co/400x400?text=No+Image"}
          alt={product.name}
          className="w-full h-60 object-cover rounded-lg mb-4"
        />

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {product.name}
        </h2>

        <p className="text-gray-700 mb-2">
          {product.description || "No description available."}
        </p>

        <p className="text-lg font-semibold text-gray-800">
          Rs.{product.price.toLocaleString()}
        </p>

        {/* Stock info */}
        {product.stock !== undefined && (
          <p className="text-sm mt-1 mb-4 text-gray-600">
            {outOfStock ? (
              <span className="font-semibold text-red-600">Out of stock</span>
            ) : (
              <>
                In stock:{" "}
                <span className="font-semibold text-gray-800">
                  {product.stock}
                </span>
              </>
            )}
          </p>
        )}

        <div className="flex justify-end gap-4">
          {product.affiliated_url && (
            <a
              href={product.affiliated_url}
              target="_blank"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Visit Store
            </a>
          )}

          <button
            onClick={() => {
              if (outOfStock) return
              addToCart(product)
              onClose()
            }}
            disabled={outOfStock}
            className={`px-4 py-2 rounded-md text-white ${
              outOfStock
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {outOfStock ? "Out of stock" : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  )
}
