'use client'

import { useState } from "react"
import { useCart } from "./CartContext"
import { Trash2, Plus, Minus } from "lucide-react"

export default function CartModal({ onClose }) {
  const { cart, removeFromCart, clearCart } = useCart()
  const [loading, setLoading] = useState(false)
  const [quantities, setQuantities] = useState(
    Object.fromEntries(cart.map((item) => [item.id, item.quantity]))
  )

  const total = cart.reduce(
    (sum, item) => sum + item.price * (quantities[item.id] || item.quantity),
    0
  )

  const updateQuantity = (id, change) => {
    setQuantities((prev) => {
      const item = cart.find((p) => p.id === id)

      const current = prev[id] ?? item?.quantity ?? 1
      const max = item?.stock ?? Infinity

      const next = Math.min(Math.max(current + change, 1), max)

      return { ...prev, [id]: next }
    })
  }

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const res = await fetch("http://localhost:8000/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: "Guest User",
          items: cart.map((item) => ({
            product_id: item.id,
            quantity: quantities[item.id] || item.quantity,
          })),
        }),
      })
      if (!res.ok) throw new Error("Checkout failed")
      const data = await res.json()
      clearCart()
      window.open(data.whatsapp_url, "_blank")
    } catch (err) {
      alert("Failed " + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md animate-fadeIn text-black"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 text-center">Your Cart</h2>

        {cart.length === 0 ? (
          <p className="text-center text-gray-600">Your cart is empty.</p>
        ) : (
          <>
            <ul className="divide-y divide-gray-200 mb-4">
              {cart.map((item) => {
                const currentQty = quantities[item.id] ?? item.quantity
                const max = item.stock ?? Infinity
                const atMax = currentQty >= max

                return (
                  <li key={item.id} className="flex justify-between items-center py-2">
                    <div>
                      <span className="font-medium">{item.name}</span>

                      {/* live stock info */}
                      <div className="text-xs text-gray-500 mt-0.5">
                        In stock:{" "}
                        <span className="font-semibold">
                          {item.stock ?? "—"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => {
                            if (currentQty <= 1) {
                              removeFromCart(item.id)
                            } else {
                              updateQuantity(item.id, -1)
                            }
                          }}
                          className="p-1 rounded-full bg-gray-200 hover:bg-gray-300"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-gray-800 w-6 text-center">
                          {currentQty}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={atMax}
                          className={`p-1 rounded-full ${
                            atMax
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-gray-200 hover:bg-gray-300"
                          }`}
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        Rs.
                        {(
                          item.price *
                          (quantities[item.id] || item.quantity)
                        ).toLocaleString()}
                      </span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="text-right font-bold text-gray-800 mb-4">
              Total: Rs.{total.toLocaleString()}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
              >
                Close
              </button>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
              >
                {loading ? "Processing..." : "Checkout"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
