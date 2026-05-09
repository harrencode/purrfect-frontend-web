"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { saveAuthSession } from "../../lib/authSession";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function SignIn() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Hide Navbar/Footer on Sign-in page
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const validateForm = () => {
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
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
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

      const data = await response.json();
      // Redirect if email not verified
      if (response.status === 403 && data?.detail?.code === "EMAIL_NOT_VERIFIED") {
        router.replace(`/verify-account?email=${encodeURIComponent(data.detail.email || form.email)}`);

        return;
      }

      if (!response.ok) {
        const msg =
          typeof data?.detail === "string"
            ? data.detail
            : data?.detail?.code === "ACCOUNT_INACTIVE"
              ? "Account is inactive."
              : data?.detail?.code === "EMAIL_NOT_VERIFIED"
                ? "Email not verified."
                : "Login failed";

        throw new Error(msg);
      }


      if (data?.access_token) {
        saveAuthSession(
          data.access_token,
          data.expires_in,
          data.refresh_token,
          data.refresh_expires_in,
        );
        router.push("/");
      } else {
        throw new Error("Login failed — token missing");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message.includes("denied")
          ? "Please allow location access to see nearby rescue/lost-pet alerts."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

      <div className="relative z-10 w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-8 mx-4">
        <div className="text-center mb-6">
          <Image
            alt="Purr-Fect"
            src="/images/Purr-Fect.png"
            width={160}
            height={48}
            className="mx-auto h-12 mb-2 drop-shadow-md"
          />
          <h2 className="text-3xl font-extrabold text-teal-700">Welcome Back!</h2>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Sign in to{" "}
            <span className="font-semibold text-pink-500">Purr-Fect</span> and
            reunite with your furry friends 🐾
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className={`w-full rounded-xl border ${
              error.includes("email")
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-teal-400"
            } focus:ring-2 px-4 py-2 text-gray-800 bg-white/70 placeholder-gray-500`}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={handleChange}
            className={`w-full rounded-xl border ${
              error.includes("Password")
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 focus:ring-pink-400"
            } focus:ring-2 px-4 py-2 text-gray-800 bg-white/70 placeholder-gray-500`}
          />

          {error && (
            <p className="text-red-600 text-center font-medium text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-teal-400 to-pink-400 hover:from-teal-300 hover:to-pink-300 text-white py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-700 text-sm">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="text-teal-600 hover:text-pink-500 font-semibold transition"
          >
            Sign Up
          </a>
        </p>

        <p className="mt-2 text-center text-sm text-gray-500">
          <a href="#" className="hover:underline">
            Forgot your password?
          </a>
        </p>
      </div>
    </div>
  );
}
