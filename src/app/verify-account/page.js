"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MailCheck, RotateCcw, ShieldAlert } from "lucide-react";
import { saveAuthSession } from "../lib/authSession";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function VerifyAccountInner() {
  const params = useSearchParams();
  const router = useRouter();

  const emailFromQuery = params.get("email");
  const adminEmailFromQuery = params.get("adminEmail");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [adminEmail, setAdminEmail] = useState(adminEmailFromQuery || "");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!emailFromQuery) {
      router.replace("/signin");
    }
  }, [emailFromQuery, router]);

  const email = emailFromQuery;
  const adminNotice = useMemo(() => {
    if (!adminEmail) return "";
    return `Your email is not verified in AWS SES yet. The code was sent to the system admin at ${adminEmail}. Please get the code from the system admin and enter it here.`;
  }, [adminEmail]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/verify-code`, {
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
        setError("Verification succeeded but the token was missing.");
        return;
      }

      saveAuthSession(
        data.access_token,
        data.expires_in,
        data.refresh_token,
        data.refresh_expires_in,
      );
      router.replace("/");
    } catch {
      setError("Something went wrong while verifying your account.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setInfo("");
    setResending(true);

    try {
      const res = await fetch(`${API_BASE}/auth/resend-code`, {
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

      if (data?.requires_admin_code && data?.admin_email) {
        setAdminEmail(data.admin_email);
        setInfo(
          `A new code was sent to the system admin at ${data.admin_email}.`,
        );
        return;
      }

      setInfo(data?.message || "A new code has been sent. Check your email.");
    } catch {
      setError("Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  if (!email) return null;

  return (
    <main
      className="min-h-screen bg-cover bg-center px-4 py-6 text-slate-950"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.95fr_1fr]">
        <aside className="hidden lg:block">
          <Image
            alt="Purr-Fect"
            src="/images/Purr-Fect.png"
            width={190}
            height={56}
            className="mb-8 h-14 w-auto"
          />
          <div className="max-w-md">
            <p className="mb-3 inline-flex items-center gap-2 rounded-[8px] bg-white/80 px-3 py-2 text-sm font-semibold text-teal-700 shadow-sm">
              <MailCheck size={16} />
              Account verification
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-700">
              One code unlocks your Purr-Fect account.
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">
              Enter the verification code for {email}. Once confirmed, we will
              sign you in automatically.
            </p>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-md rounded-[8px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/20 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Verify account
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Code for <span className="font-semibold">{email}</span>
              </p>
            </div>
            <div className="rounded-[8px] bg-teal-50 p-3 text-teal-700">
              <MailCheck size={22} />
            </div>
          </div>

          {adminNotice && (
            <div className="mb-4 rounded-[8px] border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              <div className="mb-1 flex items-center gap-2 font-bold">
                <ShieldAlert size={17} />
                Code sent to system admin
              </div>
              <p className="leading-6">{adminNotice}</p>
            </div>
          )}

          <form onSubmit={handleVerify} className="space-y-4">
            <input
              className="w-full rounded-[8px] border border-slate-200 bg-white px-3 py-3 text-center text-lg font-bold tracking-[0.45em] text-slate-950 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10"
              inputMode="numeric"
              maxLength={6}
              onChange={(e) => setCode(e.target.value)}
              placeholder="000000"
              required
              type="text"
              value={code}
            />

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            )}
            {info && (
              <div className="rounded-[8px] border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {info}
              </div>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Verifying..." : "Verify and sign in"}
              <ArrowRight size={17} />
            </button>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-[8px] border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:border-teal-400 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={resending}
              onClick={handleResend}
              type="button"
            >
              <RotateCcw size={16} />
              {resending ? "Sending..." : "Resend code"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

export default function VerifyAccount() {
  return (
    <Suspense fallback={null}>
      <VerifyAccountInner />
    </Suspense>
  );
}
