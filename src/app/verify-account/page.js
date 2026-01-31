"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function VerifyAccount() {
  const params = useSearchParams();
  const router = useRouter();

  const emailFromQuery = params.get("email");

  useEffect(() => {
    if (!emailFromQuery) {
      router.replace("/signin");
    }
  }, [emailFromQuery, router]);

  const email = emailFromQuery;
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : data?.detail?.message || "Verification failed";
        setError(msg);
        return;
      }

      if (!data?.access_token) {
        setError("Verification succeeded but token missing.");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      document.cookie = `access_token=${data.access_token}; path=/; max-age=86400; samesite=strict`;

      router.replace("/");
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);

    try {
      const res = await fetch("http://localhost:8000/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : data?.detail?.message || "Failed to resend code";
        setError(msg);
        return;
      }

      setInfo(data?.message || "A new code has been sent. Check your email.");
    } catch {
      setError("Failed to resend code");
    } finally {
      setResending(false);
    }
  };

  // Prevent flicker before redirect
  if (!email) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-500 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold text-center mb-2 text-black">Verify your account</h1>
        <p className="text-center text-gray-600 mb-6">
          Enter the 6-digit code sent to your email.
        </p>

        <form onSubmit={handleVerify} className="space-y-4 text-black">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="6-digit code"
            className="w-full rounded-xl border px-3 py-2 tracking-widest text-center"
            required
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          {info && <p className="text-green-600 text-sm text-center">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white rounded-xl py-2 font-semibold"
          >
            {loading ? "Verifying..." : "Verify & Login"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full border rounded-xl py-2 font-semibold"
          >
            {resending ? "Sending..." : "Resend code"}
          </button>
        </form>
      </div>
    </div>
  );
}
