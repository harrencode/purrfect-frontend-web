"use client";

import { useState } from "react";
import { MapPin, PawPrint, X } from "lucide-react";
import Image from "next/image";

export default function RescueMissions({ missions = [], loading, error, refresh }) {
  const [buttonLoading, setButtonLoading] = useState({});
  const [selectedMission, setSelectedMission] = useState(null);

  const API_URL = "http://localhost:8000/rescue-rep/";

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
        const chatRes = await fetch("http://localhost:8000/chats/", {
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
            status: mission.status === "Pending" ? "InProgress" : mission.status,
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

  if (loading) return <p className="text-center mt-10">Loading rescues...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  return (
    <section className="w-full bg-gray-300 py-10 px-6 md:px-16">
      <h2 className="text-2xl font-semibold text-[#9b6241] mb-8">
        All Rescue Missions
      </h2>

      {missions.length === 0 ? (
        <p className="text-gray-700">No rescue missions found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {missions.map((mission) => (
            <div
              key={mission.reportId}
              className="bg-[#c6b29f] rounded-2xl shadow-md p-4 flex flex-col justify-between"
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
                    : `http://localhost:8000${selectedMission.photo}`
                }
                alt="Rescue mission"
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
