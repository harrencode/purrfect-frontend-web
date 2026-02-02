"use client";
import React from "react";
import Image from "next/image";

export default function NearbyLostPets({ pets, loading }) {
  // Status badge color helper
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

  // Loading State
  if (loading)
    return (
      <div className="py-12 text-center text-gray-500 bg-yellow-50">
        <div className="animate-pulse flex justify-center mb-4">
          <div className="w-12 h-12 bg-yellow-300 rounded-full" />
        </div>
        <p className="text-lg font-medium">Loading nearby lost pets...</p>
      </div>
    );

  // No pets
  if (!pets?.length)
    return (
      <p className="text-center text-gray-500 py-8 bg-yellow-50">
        No lost pets found near your area.
      </p>
    );

  // Pet Cards
  return (
    <section className="py-10 px-10 bg-yellow-50">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center md:text-left">
        🐾 Missing Paws Near You
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {pets.map((pet, i) => (
          <div
            key={pet.reportId || i}
            className="group relative bg-white rounded-2xl border border-yellow-200 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
          >
            {/* Pet Photo */}
            <div className="relative">
              <Image
                src={pet.photo || "/images/default-pet.png"}
                alt={pet.pet_name || "Lost Pet"}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
              />

              {/* Status Badge */}
              <span
                className={`absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-full pointer-events-none ${getStatusClasses(
                  pet.status
                )}`}
              >
                {pet.status || "Unknown"}
              </span>
            </div>

            {/* Pet Details */}
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

              {/* Chat Button */}
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
    </section>
  );
}
