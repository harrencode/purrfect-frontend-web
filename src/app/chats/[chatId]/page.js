"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { MapPin, PawPrint, User, Navigation } from "lucide-react";
import Image from "next/image";

const API_BASE = "http://localhost:8000";

// base64url-safe JWT decode
function decodeJwt(token) {
  try {
    const part = token?.split(".")?.[1];
    if (!part) return null;

    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + (4 - (base64.length % 4)) % 4,
      "="
    );

    return JSON.parse(atob(padded));
  } catch (e) {
    console.error("JWT decode failed:", e);
    return null;
  }
}

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rescueReport, setRescueReport] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  const containerRef = useRef(null);

  // make token reactive (instead of const)
  const [token, setToken] = useState(
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null
  );

  useEffect(() => {
    // keep in sync if token changes later
    const onStorage = () => setToken(localStorage.getItem("access_token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Decode current user ID from JWT (robust)
  useEffect(() => {
    if (!token) return;

    const payload = decodeJwt(token);
    // console.log("JWT payload:", payload);

    const uid = payload?.id ?? payload?.user_id ?? payload?.sub;
    setCurrentUserId(uid ?? null);
  }, [token]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!chatId || !token) return;
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch messages (${res.status})`);
      const data = await res.json();
      setMessages(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chatId, token]);

  // Fetch rescue report
  const fetchRescueReport = useCallback(async () => {
    if (!chatId || !token) return;
    try {
      const res = await fetch(`${API_BASE}/rescue-rep/by-chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRescueReport(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [chatId, token]);

  // Auto refresh every 5 seconds
  useEffect(() => {
    fetchMessages();
    fetchRescueReport();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [chatId, fetchMessages, fetchRescueReport]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message
  const sendMessage = async () => {
    if (!text.trim() || !chatId || !token) return;
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok) throw new Error(`Failed to send message (${res.status})`);
      const newMsg = await res.json();
      setMessages((prev) => [...prev, newMsg]);
      setText("");
    } catch (err) {
      alert(err.message);
    }
  };

  // Mark rescue as resolved
  const markAsResolved = async () => {
    if (!rescueReport || !token) return;
    try {
      const res = await fetch(`${API_BASE}/rescue-rep/${rescueReport.reportId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "Resolved" }),
      });
      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);
      const updated = await res.json();
      setRescueReport(updated);

      // Add system message
      const sysRes = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: "This rescue report has been marked as resolved.",
        }),
      });
      if (sysRes.ok) {
        const sysMsg = await sysRes.json();
        setMessages((prev) => [...prev, sysMsg]);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Open Google Maps directions
  const openDirections = () => {
    if (rescueReport?.latitude && rescueReport?.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${rescueReport.latitude},${rescueReport.longitude}`,
        "_blank"
      );
    } else if (rescueReport?.location) {
      const q = encodeURIComponent(rescueReport.location);
      window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
    } else {
      alert("No location available for this rescue.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading chat...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  // Build reporter name
  const reporterName =
    rescueReport?.userFullName ||
    `${rescueReport?.userFirstName || ""} ${rescueReport?.userLastName || ""}`.trim() ||
    "Unknown User";

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-black">
      {/* Rescue Report Summary */}
      {rescueReport && (
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
          {/* Image */}
          <div className="relative">
            <Image
              src={rescueReport.photo || "/images/placeholder.png"}
              alt="Rescue"
              className="w-full h-60 object-cover"
              onError={(e) => (e.target.src = "/images/placeholder.png")}
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  rescueReport.alert_type === "Critical"
                    ? "bg-red-600 text-white"
                    : rescueReport.alert_type === "High"
                    ? "bg-yellow-400 text-black"
                    : "bg-green-500 text-white"
                }`}
              >
                {rescueReport.alert_type} Alert
              </span>
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  rescueReport.status === "Resolved"
                    ? "bg-green-200 text-green-800"
                    : rescueReport.status === "InProgress"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-red-200 text-red-800"
                }`}
              >
                {rescueReport.status}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-5 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <PawPrint className="w-5 h-5 text-gray-600" />
              Rescue Report Details
            </h2>
            <p className="text-gray-700 text-sm">{rescueReport.description}</p>

            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4 text-red-500" />
              {rescueReport.location || "Unknown location"}
            </div>

            {/* Get Directions Button */}
            {rescueReport.location && (
              <button
                onClick={openDirections}
                className="mt-2 flex items-center gap-2 text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full transition"
              >
                <Navigation className="w-4 h-4" />
                Get Directions
              </button>
            )}

            {/* Reporter */}
            <p className="text-sm text-gray-500">
              Reported by:{" "}
              <span className="font-medium text-gray-800">{reporterName}</span>
            </p>
          </div>
        </div>
      )}

      {/* Chat Section */}
      <h2 className="text-xl font-semibold mb-3">Rescue Chat</h2>

      {rescueReport?.status === "Resolved" ? (
        <p className="mb-4 text-green-700 font-semibold">
          This rescue report has been resolved.
        </p>
      ) : (
        // robust compare
        String(currentUserId) === String(rescueReport?.userId) && (
          <button
            onClick={markAsResolved}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full transition"
          >
            Mark as Resolved
          </button>
        )
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        className="w-full max-w-3xl border rounded-lg h-[500px] overflow-y-auto p-3 bg-white shadow-inner mb-4"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 mt-10">No messages yet.</p>
        ) : (
          messages.map((m) => {
            // robust compare
            const isSelf = String(m.senderId) === String(currentUserId);
            return (
              <div
                key={m.messageId}
                className={`flex mb-4 ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] p-3 rounded-2xl ${
                    isSelf
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  {!isSelf && (
                    <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {m.senderName || m.senderId}
                    </div>
                  )}
                  <div className="text-sm leading-snug whitespace-pre-wrap">
                    {m.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      {rescueReport?.status !== "Resolved" && (
        <div className="w-full max-w-3xl flex gap-2">
          <input
            className="flex-1 border border-gray-300 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your message..."
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())
            }
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full transition"
          >
            Send
          </button>
        </div>
      )}
    </div>
  );
}
