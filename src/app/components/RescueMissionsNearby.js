"use client";

import { useState } from "react";
import { MapPin, PawPrint, X } from "lucide-react";
import Image from "next/image";

export default function RescueMissionsNearby({ missions = [], loading, error, refresh }) {
  const [buttonLoading, setButtonLoading] = useState({});
  const [selectedMission, setSelectedMission] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_URL = `${API_BASE}/rescue-rep/`;

  const startRescue = async (reportId) => {
    const token = localStorage.getItem("access_token");
    if (!token) return alert("Login first");

    setButtonLoading((prev) => ({ ...prev, [reportId]: true }));

    try {
      const mission = missions.find((m) => m.reportId === reportId);
      if (!mission) throw new Error("Mission not found");

      let chatId = mission.chatId;

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

        const updateBody =
          mission.status === "Pending"
            ? { chat_id: chatId, status: "InProgress" }
            : { chat_id: chatId };

        const updateRes = await fetch(`${API_URL}${reportId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
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
        if (!updateRes.ok) throw new Error("Failed to update status");
      }

      await refresh(); // Refresh nearby list
      if (chatId) window.open(`/chats/${chatId}`, "_blank");
    } catch (err) {
      alert(err.message);
    } finally {
      setButtonLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  if (loading) return <p className="text-center mt-10">Loading nearby rescues...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <section className="w-full bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200 py-10 px-6 md:px-16">
      <h2 className="text-2xl font-semibold text-slate-800 mb-8">
        Rescue Missions Near You
      </h2>

      {missions.length === 0 ? (
        <div className="rounded-2xl border border-amber-200 bg-white/80 p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-gray-800">
            No nearby missions
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Try again later or expand your search radius.
          </p>
          <a
            href="/rescues"
            className="mt-3 inline-flex items-center justify-center rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500"
          >
            View all rescues
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {missions.map((mission) => (
            <div
              key={mission.reportId}
              className="bg-white rounded-2xl shadow-md p-4 border border-amber-100 flex flex-col justify-between"
            >
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

              <div className="flex items-start gap-2 text-sm text-black mb-2">
                <MapPin className="text-red-600 w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{mission.location}</span>
              </div>

              <div className="flex items-start gap-2 text-sm text-black mb-4">
                <PawPrint className="text-black w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{mission.description}</span>
              </div>

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
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 text-black">
          <div className="bg-white rounded-xl p-6 relative max-w-lg w-full">
            <button
              onClick={() => setSelectedMission(null)}
              className="absolute top-3 right-3 text-gray-700 hover:text-black"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-semibold mb-3 text-[#9b6241]">
              Mission Details
            </h3>

            {selectedMission.photo && (
              <Image
                src={
                  selectedMission.photo.startsWith("http")
                    ? selectedMission.photo
                    : `${API_BASE}${selectedMission.photo}`
                }
                alt="Rescue mission"
                width={640}
                height={256}
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
            )}

            <p><strong>Location:</strong> {selectedMission.location}</p>
            <p><strong>Description:</strong> {selectedMission.description}</p>
            <p><strong>Status:</strong> {selectedMission.status}</p>
            <p><strong>Reported by:</strong> {selectedMission.userFirstName}</p>
          </div>
        </div>
      )}
    </section>
  );
}
