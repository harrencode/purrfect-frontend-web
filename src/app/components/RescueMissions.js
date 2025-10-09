"use client";

import { MapPin, PawPrint } from "lucide-react";

const missions = [
  {
    id: 1,
    alert: "Critical Alert",
    alertColor: "bg-red-600 text-white",
    status: "Not attended",
    statusColor: "bg-red-400 text-white",
    location: "Cargills Food City - Weligama, Cargills Food City, Weligama 81700",
    description: "Injured Dog - Bleeding - Missing leg",
    reporter: "Nipun Dhananjaya",
    buttonText: "Start the Rescue",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: 2,
    alert: "High Alert",
    alertColor: "bg-yellow-400 text-black",
    status: "In Progress",
    statusColor: "bg-yellow-300 text-black",
    location: "XCMP+JC4, Weligama",
    description: "Abounded Kitten - No mother - Infected",
    reporter: "Ruwan Perera",
    buttonText: "Join the Rescue",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
  },
  // add more cards here...
];

export default function RescueMissions() {
  return (
    <section className="w-full bg-gray-300 py-10 px-6 md:px-16">
      <h2 className="text-2xl font-semibold text-[#9b6241] mb-8">
        Rescue Missions near you
      </h2>

      {/* Responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
        {missions.map((mission) => (
          <div
            key={mission.id}
            className="bg-[#c6b29f] rounded-2xl shadow-md p-4 flex flex-col justify-between"
          >
            {/* Header tags */}
            <div className="flex justify-between items-center mb-3">
              <span
                className={`text-sm font-semibold px-3 py-1 rounded ${mission.alertColor}`}
              >
                {mission.alert}
              </span>
              <span
                className={`text-sm font-semibold px-3 py-1 rounded ${mission.statusColor}`}
              >
                Status - {mission.status}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-start gap-2 text-sm text-black mb-2">
              <MapPin className="text-red-600 w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{mission.location}</span>
            </div>

            {/* Description */}
            <div className="flex items-start gap-2 text-sm text-black mb-4">
              <PawPrint className="text-black w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{mission.description}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mb-3">
              <button
                className={`${mission.buttonColor} text-white px-4 py-2 rounded-full text-sm font-medium transition`}
              >
                {mission.buttonText}
              </button>
              <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium transition">
                More Details
              </button>
            </div>

            {/* Reporter info */}
            <p className="text-xs text-black font-medium">
              Reported by - {mission.reporter}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
