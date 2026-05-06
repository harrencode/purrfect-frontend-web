"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { PawPrint, User, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function decodeJwt(token) {
  try {
    const part = token?.split(".")?.[1];
    if (!part) return null;

    // base64url -> base64
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    // pad
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

export default function AdoptionChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adoptionReq, setAdoptionReq] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // make token reactive
  const [token, setToken] = useState(null);

  // image slider state
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

    // Optional: if your app updates token later, this helps
    const onStorage = () => setToken(localStorage.getItem("access_token"));
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Decode current user ID from JWT (robust)
  useEffect(() => {
    if (!token) return;
    const payload = decodeJwt(token);
    console.log("JWT payload:", payload);

    // FastAPI often uses `sub`
    const uid = payload?.id ?? payload?.user_id ?? payload?.sub;
    setCurrentUserId(uid ?? null);
  }, [token]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!chatId || !token) return;

    setError("");
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Failed to fetch messages (${res.status}) ${t}`);
      }

      const data = await res.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  }, [chatId, token]);

  // Fetch adoption request linked to this chat
  const fetchAdoptionRequest = useCallback(async () => {
    if (!chatId || !token) return;

    try {
      const res = await fetch(`${API_BASE}/adoption_reqs/by-chat/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAdoptionReq(data);
      }
    } catch (err) {
      console.error(err);
    }
  }, [chatId, token]);

  // Refresh periodically
  useEffect(() => {
    fetchMessages();
    fetchAdoptionRequest();

    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [fetchMessages, fetchAdoptionRequest]);

  // Auto-scroll chat to bottom
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
      alert(err?.message || "Failed to send message");
    }
  };

  // Mark as Adopted
  const markAsAdopted = async () => {
    if (!adoptionReq || !token) return;

    try {
      const res = await fetch(
        `${API_BASE}/adoption_reqs/${adoptionReq.id}?adopt_id=${adoptionReq.id}&owner_id=${adoptionReq.pet.owner_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "Completed" }),
        }
      );

      if (!res.ok) throw new Error(`Failed to update status (${res.status})`);

      const updated = await res.json();
      setAdoptionReq(updated);

      // Add system message
      if (updated.chat_id) {
        const sysRes = await fetch(`${API_BASE}/chats/${updated.chat_id}/messages`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: "🎉 Adoption has been successfully completed!",
          }),
        });

        if (sysRes.ok) {
          const sysMsg = await sysRes.json();
          setMessages((prev) => [...prev, sysMsg]);
        }
      }
    } catch (err) {
      alert(err?.message || "Failed to update adoption status");
    }
  };

  // Handle image navigation
  const nextImage = () => {
    if (!adoptionReq?.pet?.images?.length) return;
    setCurrentImgIdx((i) => (i + 1) % adoptionReq.pet.images.length);
  };

  const prevImage = () => {
    if (!adoptionReq?.pet?.images?.length) return;
    setCurrentImgIdx(
      (i) => (i - 1 + adoptionReq.pet.images.length) % adoptionReq.pet.images.length
    );
  };

  if (loading) return <p className="text-center mt-10">Loading chat...</p>;
  if (error) return <p className="text-center mt-10 text-red-600">{error}</p>;

  const pet = adoptionReq?.pet;
  const images = pet?.images || [];

  // robust comparisons
  const isOwner =
    adoptionReq?.pet?.owner_id != null &&
    currentUserId != null &&
    String(currentUserId) === String(adoptionReq.pet.owner_id);

  return (
    <div className="min-h-screen flex flex-col items-center p-4 bg-gray-50 text-black">
      {/* Adoption Summary Card */}
      {adoptionReq && (
        <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden mb-6 border border-gray-200">
          {/* Image Carousel */}
          <div className="relative">
            <Image
              src={images[currentImgIdx] || "/images/placeholder.png"}
              alt={pet?.name || "Pet"}
              width={768}
              height={240}
              className="w-full h-60 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/placeholder.png";
              }}
            />

            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-800" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/70 hover:bg-white rounded-full p-2 shadow"
                >
                  <ChevronRight className="w-5 h-5 text-gray-800" />
                </button>
              </>
            )}

            <div className="absolute top-3 left-3 flex gap-2">
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  adoptionReq.status === "Completed"
                    ? "bg-green-200 text-green-800"
                    : adoptionReq.status === "Pending"
                    ? "bg-yellow-200 text-yellow-800"
                    : "bg-blue-200 text-blue-800"
                }`}
              >
                {adoptionReq.status}
              </span>
            </div>
          </div>

          {/* Pet Details */}
          <div className="p-5 space-y-2">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="inline-flex"><PawPrint className="w-5 h-5 text-gray-600" /></span>
              Pet Details
            </h2>
            <p className="text-gray-700 text-sm">
              <span className="font-semibold">{pet?.name || "Unknown"}</span> —{" "}
              {pet?.species || "Unknown"} ({pet?.gender || "N/A"})
            </p>
            <p className="text-gray-700 text-sm">
              Age: {pet?.age || 0} yrs • Size: {pet?.size || "N/A"} • Temperament:{" "}
              {pet?.temperament || "N/A"}
            </p>
            <p className="text-gray-700 text-sm italic">
              Activity Level: {pet?.activity_level || "N/A"}
            </p>
            <p className="text-gray-600 text-sm">
              {pet?.description || "No description"}
            </p>
          </div>
        </div>
      )}

      {/* 💬 Chat Section */}
      <h2 className="text-xl font-semibold mb-3">Adoption Chat</h2>

      {adoptionReq?.status === "Completed" ? (
        <p className="mb-4 text-green-700 font-semibold">
          This adoption request has been completed.
        </p>
      ) : (
        isOwner && (
          <button
            onClick={markAsAdopted}
            className="mb-4 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full transition"
          >
            Mark as Adopted
          </button>
        )
      )}

      {/* Messages */}
      <div
        ref={containerRef}
        className="w-full max-w-3xl border rounded-lg h-[500px] overflow-y-auto p-3 bg-white shadow-inner mb-4"
      >
        {messages.length === 0 ? (
          <div className="mx-auto mt-10 max-w-md rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
            <p className="text-base font-semibold text-gray-800">
              No messages yet
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Introduce yourself to get the adoption chat started.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isSelf =
              currentUserId != null && m?.senderId != null
                ? String(m.senderId) === String(currentUserId)
                : false;

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
      {adoptionReq?.status !== "Completed" && (
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
