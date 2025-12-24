'use client'

import { ShoppingCart, Store, History } from "lucide-react"
import ItemCard from "../components/ItemCard"
import { CartProvider } from "../components/CartContext"
import CartModal from "../components/CartModal"
import OrderHistoryModal from "../components/OrderHistoryModal"
import { useState } from "react"
import FullPageLoader from "../components/FullPageLoader" 

export default function Shop() {
  const [showCart, setShowCart] = useState(false)
  const [showOrders, setShowOrders] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  return (
    <CartProvider>
      <div className="min-h-screen bg-yellow-50 relative">
        {pageLoading && <FullPageLoader />}
        {/* Hero Section */}
        <section
          className="relative w-full h-[420px] flex items-center justify-center bg-gradient-to-br from-yellow-100 via-white to-yellow-50"
          style={{ backgroundImage: "url('/images/hero-image.png')" }}
        >
          <div className="bg-white/60 backdrop-blur-md rounded-2xl shadow-xl px-10 py-8 max-w-4xl w-[90%] flex flex-col md:flex-row items-center gap-8 border border-white/40">
            <div className="flex-shrink-0">
              <Store className="w-24 h-24 text-green-700" />
            </div>

            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-green-800 leading-tight">
                From Collars to Cuddles — We’ve Got It All 🐶
              </h2>
              <p className="text-gray-700 mt-3 text-sm md:text-base">
                Style, Comfort, and Wag — Accessories They’ll Love.<br />
                For Pets Who Deserve the Best.
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6">
                <button
                  onClick={() => setShowCart(true)}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full transition shadow-md"
                >
                  <ShoppingCart size={18} /> View Cart
                </button>

                <button
                  onClick={() => setShowOrders(true)}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full transition shadow-md"
                >
                  <History size={18} /> Order History
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Modals */}
        {showCart && <CartModal onClose={() => setShowCart(false)} />}
        {showOrders && <OrderHistoryModal onClose={() => setShowOrders(false)} />}

        {/* Product Grid */}
        <section className="m-auto px-10 py-12 bg-yellow-50">
          <ItemCard onInitialLoadComplete={() => setPageLoading(false)} />
        </section>

      </div>
    </CartProvider>
  )
}
