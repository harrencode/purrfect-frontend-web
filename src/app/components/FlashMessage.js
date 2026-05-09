"use client";

import { useEffect } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export default function FlashMessage({
  message,
  type = "success",
  onDismiss,
  duration = 3500,
}) {
  useEffect(() => {
    if (!message || !onDismiss) return;

    const timer = window.setTimeout(onDismiss, duration);
    return () => window.clearTimeout(timer);
  }, [duration, message, onDismiss]);

  if (!message) return null;

  const isSuccess = type === "success";
  const Icon = isSuccess ? CheckCircle2 : XCircle;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed right-4 top-20 z-[60] flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
        isSuccess
          ? "border-emerald-100 bg-emerald-50 text-emerald-800"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      <Icon size={18} className="shrink-0" />
      <span>{message}</span>
    </div>
  );
}
