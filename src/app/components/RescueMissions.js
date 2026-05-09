"use client";

import { useState } from "react";
import { MapPin, PawPrint, X } from "lucide-react";
import Image from "next/image";

export default function RescueMissions({
  missions = [],
  loading,
  error,
  refresh,
}) {
  const [buttonLoading, setButtonLoading] = useState({});
  const [selectedMission, setSelectedMission] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_URL = `${API_BASE}/rescue-rep/`;

  // Start or Join a Rescue
  const startRescue = async (reportId) => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login first");

    setButtonLoading((prev) => ({ ...prev, [reportId]: true }));

    try {
      const mission = missions.find((m) => m.reportId === reportId);
      if (!mission) throw new Error("Mission not found");

      let chatId = mission.chatId;

      // If no chat exists, create one
      if (!chatId) {
        const chatRes = await fetch(`${API_BASE}/chats/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chat_type: "rescue",
            related_entity_id: reportId,
          }),
        });
        if (!chatRes.ok) throw new Error("Failed to create chat");
        const chatData = await chatRes.json();
        chatId = chatData.chatId;

        // Update report with chat ID + status
        const updateRes = await fetch(`${API_URL}${reportId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            chat_id: chatId,
            status:
              mission.status === "Pending" ? "InProgress" : mission.status,
          }),
        });

        if (!updateRes.ok) throw new Error("Failed to update report");
      } else if (mission.status === "Pending") {
        const updateRes = await fetch(`${API_URL}${reportId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "InProgress" }),
        });
        if (!updateRes.ok) throw new Error("Failed to update report");
      }

      await refresh(); // Refresh the parent list immediately
      if (chatId) window.open(`/chats/${chatId}`, "_blank");
    } catch (err) {
      alert(err.message);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <section className="w-full bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200 py-10 px-6 md:px-16">
      <h2 className="text-2xl font-semibold text-slate-800 mb-8">
        All Rescue Missions
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-amber-100 bg-white p-4 shadow-md"
            >
              <div className="mb-4 flex justify-between gap-3">
                <div className="h-7 w-28 animate-pulse rounded bg-red-100" />
                <div className="h-7 w-24 animate-pulse rounded bg-amber-100" />
              </div>
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              </div>
              <div className="mt-5 flex gap-3">
                <div className="h-10 w-36 animate-pulse rounded-full bg-blue-100" />
                <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
              </div>
            </div>
          ))}
        </div>
      ) : missions.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">
            No rescue missions yet
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Check back soon or create a new rescue report.
          </p>
          <a
            href="/rescues"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
          >
            Report a rescue
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {missions.map((mission) => (
            <div
              key={mission.reportId}
              className="bg-white rounded-2xl shadow-md p-4 border border-amber-100 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded ${
                    mission.alert_type === "Critical"
                      ? "bg-red-600 text-white"
                      : mission.alert_type === "High"
                        ? "bg-yellow-400 text-black"
                        : "bg-gray-400 text-black"
                  }`}
                >
                  {mission.alert_type} Alert
                </span>

                <span
                  className={`text-sm font-semibold px-3 py-1 rounded ${
                    mission.status === "Pending"
                      ? "bg-red-400 text-white"
                      : mission.status === "InProgress"
                        ? "bg-yellow-300 text-black"
                        : "bg-green-400 text-white"
                  }`}
                >
                  {mission.status}
                </span>
              </div>

              {/* Details */}
              <div className="flex items-start gap-2 text-sm text-black mb-2">
                <MapPin className="text-red-600 w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{mission.location}</span>
              </div>

              <div className="flex items-start gap-2 text-sm text-black mb-4">
                <PawPrint className="text-black w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{mission.description}</span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mb-3">
                <button
                  onClick={() => startRescue(mission.reportId)}
                  disabled={buttonLoading[mission.reportId]}
                  className={`bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium transition ${
                    buttonLoading[mission.reportId]
                      ? "opacity-60 cursor-not-allowed"
                      : ""
                  }`}
                >
                  {buttonLoading[mission.reportId]
                    ? "Processing..."
                    : "Start/Join Rescue"}
                </button>

                <button
                  onClick={() => setSelectedMission(mission)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-full text-sm font-medium transition"
                >
                  More Details
                </button>
              </div>

              <p className="text-xs text-black font-medium">
                Reported by - {mission.userFirstName || "Unknown"}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedMission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 text-black backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25">
            <button
              onClick={() => setSelectedMission(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:text-slate-900"
              aria-label="Close mission details"
            >
              <X size={18} />
            </button>

            {selectedMission.photo && (
              <div className="h-64 w-full bg-slate-100">
                <Image
                  src={
                    selectedMission.photo.startsWith("http")
                      ? selectedMission.photo
                      : `${API_BASE}${selectedMission.photo}`
                  }
                  alt="Rescue mission"
                  width={640}
                  height={256}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Rescue mission
              </p>
              <h3 className="mt-1 text-xl font-semibold text-slate-950">
                Mission Details
              </h3>

              <div className="mt-5 space-y-3 text-sm text-slate-700">
                <p>
                  <strong className="text-slate-950">Location:</strong>{" "}
                  {selectedMission.location}
                </p>
                <p>
                  <strong className="text-slate-950">Description:</strong>{" "}
                  {selectedMission.description}
                </p>
                <p>
                  <strong className="text-slate-950">Status:</strong>{" "}
                  {selectedMission.status}
                </p>
                <p>
                  <strong className="text-slate-950">Reported by:</strong>{" "}
                  {selectedMission.userFirstName || "Unknown"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
