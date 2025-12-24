"use client";

import { PawPrint } from "lucide-react";

export default function FullPageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#f5ebe2] via-white to-[#d9c6b5]">
      {/* Subtle vignette / overlay */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      <div
        className="relative z-10 flex flex-col items-center gap-6 px-8 py-6 rounded-3xl bg-white/80 backdrop-blur-xl shadow-2xl border border-white/60"
        role="status"
        aria-live="polite"
      >
        {/* Icon + ring */}
        <div className="relative flex items-center justify-center">
          {/* Spinning ring */}
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#c6b29f]/60 border-t-[#9b6241]" />
          {/* Static icon in center */}
          <div className="absolute flex items-center justify-center">
            <PawPrint className="w-7 h-7 text-[#9b6241]" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className="text-base font-semibold text-[#9b6241]">
            Finding nearby rescue missions…
          </p>
          <p className="text-xs text-gray-600 mt-1 max-w-xs">
            We’re fetching reports and checking your location to show the most relevant rescues around you.
          </p>
        </div>

        {/* Progress shimmer bar */}
        <div className="w-60 h-1.5 rounded-full bg-gray-200 overflow-hidden">
          <div className="h-full w-1/3 rounded-full bg-[#9b6241] animate-[loaderSlide_1.4s_ease-in-out_infinite]" />
        </div>

        {/* Screen reader only text */}
        <span className="sr-only">Loading content</span>
      </div>

      
    </div>
  );
}
