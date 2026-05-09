"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Lock, Mail, MapPin, ShieldCheck } from "lucide-react";
import { saveAuthSession } from "../../lib/authSession";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nav = document.querySelector("nav");
    const footer = document.querySelector("footer");
    if (nav) nav.style.display = "none";
    if (footer) footer.style.display = "none";
    return () => {
      if (nav) nav.style.display = "";
      if (footer) footer.style.display = "";
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateForm()) return;

    setLoading(true);
    try {
      let latitude = null;
      let longitude = null;

      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 5000,
          });
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError) {
        console.warn("Location access denied or unavailable:", geoError.message);
      }

      const response = await fetch(`${API_BASE}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: form.email,
          password: form.password,
          latitude: latitude ?? "",
          longitude: longitude ?? "",
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (
        response.status === 403 &&
        data?.detail?.code === "EMAIL_NOT_VERIFIED"
      ) {
        router.replace(
          `/verify-account?email=${encodeURIComponent(data.detail.email || form.email)}`,
        );
        return;
      }

      if (!response.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : data?.detail?.code === "ACCOUNT_INACTIVE"
              ? "Account is inactive."
              : "Login failed. Please check your email and password.";
        throw new Error(msg);
      }

      if (!data?.access_token) {
        throw new Error("Login failed because the token was missing.");
      }

      saveAuthSession(
        data.access_token,
        data.expires_in,
        data.refresh_token,
        data.refresh_expires_in,
      );
      router.push("/");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-[8px] border border-slate-200 bg-white py-3 pl-11 pr-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

  return (
    <main
      className="min-h-screen bg-cover bg-center px-4 py-6 text-slate-950"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[1fr_0.9fr]">
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
              <MapPin size={16} />
              Nearby rescue alerts
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-700">
              Welcome back to your pet rescue dashboard
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">
              Sign in to manage adoptions, track reports, and stay close to
              updates in your area.
            </p>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-md rounded-[8px] border border-white/70 bg-white/90 p-6 shadow-2xl shadow-slate-900/20 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Sign in</h2>
              <p className="mt-1 text-sm text-slate-600">
                New here?{" "}
                <a className="font-semibold text-teal-700" href="/signup">
                  Create an account
                </a>
              </p>
            </div>
            <div className="rounded-[8px] bg-pink-50 p-3 text-pink-600">
              <ShieldCheck size={22} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="relative block">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                className={inputClass}
                name="email"
                onChange={handleChange}
                placeholder="Email address"
                required
                type="email"
                value={form.email}
              />
            </label>

            <label className="relative block">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                className={inputClass}
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                value={form.password}
              />
            </label>

            {error && (
              <div className="rounded-[8px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <button
              className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
              type="submit"
            >
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>

          <a
            className="mt-4 block text-center text-sm font-semibold text-slate-500 hover:text-slate-900"
            href="#"
          >
            Forgot your password?
          </a>
        </div>
      </section>
    </main>
  );
}
