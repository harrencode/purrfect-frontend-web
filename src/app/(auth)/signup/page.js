"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Camera, ChevronRight, PawPrint, ShieldCheck } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR = "/images/default-avatar.png";

export default function Signup() {
  const router = useRouter();

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

  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    confirmPassword: "",
    preferred_species: "any",
    preferred_size: "any",
    temperament: "any",
    activity_level: "any",
    min_age: "",
    max_age: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [preview, setPreview] = useState(DEFAULT_AVATAR);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePhoto(file);
    setPreview(URL.createObjectURL(file));
  };

  const validateForm = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError("Please enter your full name.");
      return false;
    }
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return false;
    }
    if (
      form.min_age &&
      form.max_age &&
      Number(form.min_age) > Number(form.max_age)
    ) {
      setError("Min age cannot be greater than max age.");
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
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "confirmPassword" && value !== "") {
          payload.append(key, value);
        }
      });
      if (profilePhoto) payload.append("profile_photo", profilePhoto);

      const response = await fetch(`${API_BASE}/auth/`, {
        method: "POST",
        body: payload,
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Signup failed",
        );
      }

      const params = new URLSearchParams({ email: form.email });
      if (data?.requires_admin_code && data?.admin_email) {
        params.set("adminEmail", data.admin_email);
      }
      router.push(`/verify-account?${params.toString()}`);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";
  const selectClass =
    "w-full rounded-[8px] border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10";

  return (
    <main
      className="min-h-screen bg-cover bg-center px-4 py-6 text-slate-950"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]" />
      <section className="relative z-10 mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[0.9fr_1.1fr]">
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
              <PawPrint size={16} />
              Adoption-ready preferences
            </p>
            <h1 className="text-4xl font-bold leading-tight text-slate-700">
              Create a profile that helps match you with the right pet.
            </h1>
            <p className="mt-4 text-base font-medium leading-7 text-slate-600">
              Add your basics, choose your adoption preferences, and verify your
              account before signing in.
            </p>
          </div>
        </aside>

        <div className="mx-auto w-full max-w-2xl rounded-[8px] border border-white/70 bg-white/90 p-5 shadow-2xl shadow-slate-900/20 md:p-7">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                Create account
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Already registered?{" "}
                <a className="font-semibold text-teal-700" href="/signin">
                  Sign in
                </a>
              </p>
            </div>
            <div className="rounded-[8px] bg-teal-50 p-3 text-teal-700">
              <ShieldCheck size={22} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                name="first_name"
                onChange={handleChange}
                placeholder="First name"
                required
                type="text"
                value={form.first_name}
              />
              <input
                className={inputClass}
                name="last_name"
                onChange={handleChange}
                placeholder="Last name"
                required
                type="text"
                value={form.last_name}
              />
            </div>

            <input
              className={inputClass}
              name="email"
              onChange={handleChange}
              placeholder="Email address"
              required
              type="email"
              value={form.email}
            />

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                name="password"
                onChange={handleChange}
                placeholder="Password"
                required
                type="password"
                value={form.password}
              />
              <input
                className={inputClass}
                name="confirmPassword"
                onChange={handleChange}
                placeholder="Confirm password"
                required
                type="password"
                value={form.confirmPassword}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-4">
              <select
                className={selectClass}
                name="preferred_species"
                onChange={handleChange}
                value={form.preferred_species}
              >
                <option value="any">Any species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
              </select>
              <select
                className={selectClass}
                name="preferred_size"
                onChange={handleChange}
                value={form.preferred_size}
              >
                <option value="any">Any size</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              <select
                className={selectClass}
                name="temperament"
                onChange={handleChange}
                value={form.temperament}
              >
                <option value="any">Any temperament</option>
                <option value="calm">Calm</option>
                <option value="playful">Playful</option>
                <option value="friendly">Friendly</option>
                <option value="energetic">Energetic</option>
                <option value="gentle">Gentle</option>
              </select>
              <select
                className={selectClass}
                name="activity_level"
                onChange={handleChange}
                value={form.activity_level}
              >
                <option value="any">Any activity</option>
                <option value="low">Low</option>
                <option value="moderate">Moderate</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <input
                className={inputClass}
                name="min_age"
                onChange={handleChange}
                placeholder="Minimum age"
                type="number"
                value={form.min_age}
              />
              <input
                className={inputClass}
                name="max_age"
                onChange={handleChange}
                placeholder="Maximum age"
                type="number"
                value={form.max_age}
              />
            </div>

            <label className="flex cursor-pointer items-center gap-4 rounded-[8px] border border-dashed border-slate-300 bg-slate-50 p-3">
              <Image
                alt="Profile preview"
                src={preview}
                width={56}
                height={56}
                className="h-14 w-14 rounded-full object-cover"
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Camera size={16} />
                  Profile photo
                </span>
                <span className="truncate text-xs text-slate-500">
                  {profilePhoto?.name || "Choose an optional image"}
                </span>
              </span>
              <input
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
                type="file"
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
              {loading ? "Creating account..." : "Continue to verification"}
              <ChevronRight size={17} />
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
