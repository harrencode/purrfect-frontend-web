"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_AVATAR = "/images/default-avatar.png";

export default function Signup() {
  const router = useRouter();

  // Hide Navbar/Footer for this page only
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

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      setPreview(URL.createObjectURL(file));
    }
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
      parseInt(form.min_age) > parseInt(form.max_age)
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
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== "") data.append(key, value);
      });
      if (profilePhoto) data.append("profile_photo", profilePhoto);

      const response = await fetch(`${API_BASE}/auth/`, {
        method: "POST",
        body: data,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Signup failed");
      }

      router.push("/signin");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: "url('/images/hero-image.png')" }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-4xl bg-white/60 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-4">
          <Image
            alt="Purr-Fect"
            src="/images/Purr-Fect.png"
            width={160}
            height={48}
            className="mx-auto h-12 mb-2 drop-shadow-md"
          />
          <h2 className="text-3xl font-extrabold text-teal-700">
            Create Your Account
          </h2>
          <p className="text-gray-700 mt-1 text-sm md:text-base">
            Join <span className="font-semibold text-pink-500">Purr-Fect</span>{" "}
            and help pets find loving homes 🐾
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              required
              value={form.first_name}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 px-3 py-2 text-gray-800 bg-white/70 placeholder-gray-500"
            />
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              required
              value={form.last_name}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 px-3 py-2 text-gray-800 bg-white/70 placeholder-gray-500"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={handleChange}
            className="w-full rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 px-3 py-2 text-gray-800 bg-white/70 placeholder-gray-500"
          />

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="password"
              name="password"
              placeholder="Password (min 6 chars)"
              required
              value={form.password}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 px-3 py-2 text-gray-800 bg-white/70 placeholder-gray-500"
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 px-3 py-2 text-gray-800 bg-white/70 placeholder-gray-500"
            />
          </div>

          {/* Preferences */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              name="preferred_species"
              value={form.preferred_species}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 px-3 py-2 text-gray-800 bg-white/70"
            >
              <option value="any">Any Species</option>
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>

            <select
              name="preferred_size"
              value={form.preferred_size}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-400 px-3 py-2 text-gray-800 bg-white/70"
            >
              <option value="any">Any Size</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>

            <select
              name="temperament"
              value={form.temperament}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 px-3 py-2 text-gray-800 bg-white/70"
            >
              <option value="any">Any Temperament</option>
              <option value="calm">Calm</option>
              <option value="playful">Playful</option>
              <option value="friendly">Friendly</option>
              <option value="energetic">Energetic</option>
              <option value="gentle">Gentle</option>
            </select>

            <select
              name="activity_level"
              value={form.activity_level}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-400 px-3 py-2 text-gray-800 bg-white/70"
            >
              <option value="any">Any Activity</option>
              <option value="low">Low</option>
              <option value="moderate">Moderate</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Age */}
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              name="min_age"
              placeholder="Min Age"
              value={form.min_age}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 px-3 py-2 text-gray-800 bg-white/70"
            />
            <input
              type="number"
              name="max_age"
              placeholder="Max Age"
              value={form.max_age}
              onChange={handleChange}
              className="rounded-xl border border-gray-300 focus:ring-2 focus:ring-teal-400 px-3 py-2 text-gray-800 bg-white/70"
            />
          </div>

          {/* Profile Photo */}
          <div className="mt-2 flex items-center gap-4">
            <Image
              src={preview}
              alt="Profile Preview"
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-400 shadow-sm"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              className="text-sm text-gray-700"
            />
          </div>

          {error && (
            <p className="text-red-600 text-center font-medium">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-teal-400 to-pink-400 hover:from-teal-300 hover:to-pink-300 text-white py-2.5 rounded-xl font-semibold shadow-md transition-all duration-300"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-700 text-sm">
          Already have an account?{" "}
          <a
            href="/signin"
            className="text-teal-600 hover:text-pink-500 font-semibold transition"
          >
            Sign In
          </a>
        </p>
      </div>
    </div>
  );
}
