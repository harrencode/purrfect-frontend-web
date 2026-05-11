"use client";

import { Info } from "lucide-react";

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  compact = false,
}) {
  const centered = align === "center";
  const rootClassName = [
    "mb-7 flex flex-col gap-2",
    compact ? "w-full" : "mx-auto max-w-7xl",
    centered
      ? "items-center text-center"
      : "sm:flex-row sm:items-end sm:justify-between",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rootClassName}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {eyebrow}
        </p>
        <div
          className={`mt-1 flex items-center gap-2 ${
            centered ? "justify-center" : ""
          }`}
        >
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          {description && (
            <span className="group relative inline-flex">
              <button
                type="button"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-emerald-100 bg-white/80 text-emerald-700 shadow-sm transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                aria-label={description}
              >
                <Info size={15} />
              </button>
              <span className="pointer-events-none absolute left-0 top-full z-20 mt-2 w-[min(16rem,calc(100vw-2rem))] rounded-lg border border-slate-100 bg-white px-3 py-2 text-left text-xs font-medium leading-5 text-slate-600 opacity-0 shadow-lg transition sm:left-1/2 sm:-translate-x-1/2 group-hover:opacity-100 group-focus-within:opacity-100">
                {description}
              </span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
