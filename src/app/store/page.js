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
      <div className="min-h-screen relative">
        {pageLoading && <FullPageLoader />}

        {/* Hero Section */}
        <section className="relative w-full min-h-[420px] overflow-hidden flex items-center">
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/hero-image.png')" }}
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/20" />

          {/* Content */}
          <div className="relative z-10 w-full px-4 py-10 sm:py-14 md:py-16 flex justify-center">
            <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/70 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-10">
                <div className="flex-shrink-0">
                  <Store className="w-20 h-20 sm:w-24 sm:h-24 text-slate-900" />
                </div>

                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                    Pet shop
                  </p>

                  <h2 className="mt-3 text-2xl md:text-3xl font-bold text-emerald-400 leading-tight">
                    From Collars to Cuddles — We’ve Got It All 🐶
                  </h2>

                  <p className="text-slate-300 mt-3 text-sm md:text-base max-w-xl">
                    Style, Comfort, and Wag — Accessories They’ll Love.
                    <br />
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

              <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
                Browse products and support the mission.
              </p>
            </div>
          </div>
        </section>


        {/* Modals */}
        {showCart && <CartModal onClose={() => setShowCart(false)} />}
        {showOrders && <OrderHistoryModal onClose={() => setShowOrders(false)} />}

        {/* Product Grid */}
        <section className="m-auto px-10 py-12 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200">
          <ItemCard onInitialLoadComplete={() => setPageLoading(false)} />
        </section>

      </div>
    </CartProvider>
  )
}
