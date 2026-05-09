"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function LostCard({ refreshKey = 0 }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_URL = `${API_BASE}/lost-found/`;
  const PLACEHOLDER_IMAGE = "/images/default-pet.png";

  useEffect(() => {
    const fetchPets = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("You must log in first to view lost/found pets.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        const data = await res.json();
        setPets(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed - LostCard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [API_URL, refreshKey]);

  if (loading)
    return (
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-amber-200 bg-white/80 shadow-sm"
          >
            <div className="h-48 animate-pulse bg-slate-200" />
            <div className="space-y-3 p-5">
              <div className="h-5 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-9 w-full animate-pulse rounded-lg bg-emerald-100" />
            </div>
          </div>
        ))}
      </div>
    );

  if (error) return <p className="text-center text-red-500 py-8">{error}</p>;

  if (!pets.length)
    return (
      <div className="mx-auto my-8 w-full max-w-2xl rounded-2xl border border-amber-200 bg-white/80 p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-gray-800">No reports yet</p>
        <p className="mt-1 text-sm text-gray-600">
          Be the first to report a lost or found pet.
        </p>
        <Link
          href="/lost-found"
          className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
        >
          Create a report
        </Link>
      </div>
    );

  // Helper function for status badge color
  const getStatusClasses = (status) => {
    switch (status) {
      case "Lost":
        return "bg-red-200 text-red-800";
      case "Found":
        return "bg-blue-200 text-blue-800";
      case "Reunited":
        return "bg-green-200 text-green-800";
      case "Archived":
        return "bg-gray-300 text-gray-800";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {pets.map((pet, i) => (
        <div
          key={pet.reportId || i}
          className="group relative bg-white rounded-2xl border border-amber-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
        >
          {/* Pet Image */}
          <div className="relative">
            <Image
              src={pet.photo || PLACEHOLDER_IMAGE}
              alt={pet.pet_name || "Unknown Pet"}
              width={400}
              height={192}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Status Badge */}
            <span
              className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full pointer-events-none ${getStatusClasses(
                pet.status,
              )}`}
            >
              {pet.status || "Unknown"}
            </span>
          </div>

          {/* Pet Info */}
          <div className="p-5">
            <h3 className="text-lg font-bold text-gray-800 truncate">
              {pet.pet_name || "Unnamed Pet"}
            </h3>

            <p className="text-sm text-gray-600 capitalize mt-1">
              {pet.gender?.toLowerCase() || "Unknown Gender"}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              📍 {pet.location || "Unknown Location"}
            </p>

            {pet.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {pet.description}
              </p>
            )}

            <button
              onClick={() => {
                if (pet.chatId)
                  window.open(`/lost-found/${pet.chatId}`, "_blank");
                else alert("Chat not available for this pet.");
              }}
              className="mt-4 w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium text-sm py-2 rounded-lg shadow-sm transition"
            >
              💬 Help Find
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
