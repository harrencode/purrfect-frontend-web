'use client'

import { useEffect, useState } from "react"
import { XCircle } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function OrderHistoryModal({ onClose }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_BASE}/cart/recent`)
        if (!res.ok) throw new Error(`HTTP ${res.status} - Failed to fetch orders`)
        const data = await res.json()

        // Ensure data is an array
        if (Array.isArray(data)) {
          setOrders(data)
        } else if (data && Array.isArray(data.orders)) {
          setOrders(data.orders)
        } else if (data && typeof data === "object") {
          // single object case (wrap in array)
          setOrders([data])
        } else {
          setOrders([])
        }
      } catch (err) {
        console.error("Error fetching orders:", err)
        setError("Failed to load order history.")
        setOrders([])
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-lg animate-fadeIn text-black overflow-y-auto max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-700">Recent Orders</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition"
            title="Close"
          >
            <XCircle size={22} />
          </button>
        </div>

        {/* State-based rendering */}
        {loading ? (
          <p className="text-center text-gray-600">Loading orders...</p>
        ) : error ? (
          <p className="text-center text-red-600">{error}</p>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white/90 p-5 text-center shadow-sm">
            <p className="text-base font-semibold text-gray-800">
              No recent orders
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Your order history will appear here after checkout.
            </p>
            <a
              href="/store"
              className="mt-3 inline-flex items-center justify-center rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-green-500"
            >
              Browse the store
            </a>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((order) => (
              <li
                key={order.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800">
                    Order #{order.id?.slice(0, 8) || "N/A"}
                  </span>
                  <span className="text-sm text-gray-600">
                    {order.date
                      ? new Date(order.date).toLocaleDateString()
                      : "Unknown date"}
                  </span>
                </div>

                {Array.isArray(order.items) && order.items.length > 0 ? (
                  <div className="text-sm text-gray-700">
                    {order.items.map((i, idx) => (
                      <div
                        key={i.product_id || idx}
                        className="flex justify-between"
                      >
                        <span>{i.name || i.product_name || "Unnamed item"}</span>
                        <span>x{i.quantity ?? 1}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No items listed</p>
                )}

                <div className="text-right mt-2 text-green-700 font-bold">
                  Total: Rs.{Number(order.total || order.total_amount || 0).toLocaleString()}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
