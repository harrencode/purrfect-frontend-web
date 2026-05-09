"use client";

import { useEffect, useRef, useState } from "react";
import { Send, X } from "lucide-react";

export default function ChatModal({ chatId, onClose, wsUrl }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const containerRef = useRef(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("user_id") : "You";

  useEffect(() => {
    if (!chatId || !token) return;

    fetch(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMessages(data))
      .catch(console.error);
  }, [chatId, token]);

  useEffect(() => {
    if (!chatId || !token || !wsUrl) return;

    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "join_chat", chatId }));
    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if (
          (payload.type === "message" || payload.type === "system") &&
          payload.chatId === chatId
        ) {
          setMessages((prev) => [...prev, payload]);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_chat", chatId }));
      }
      ws.close();
    };
  }, [chatId, token, wsUrl]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMsg = () => {
    if (!text.trim()) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "message", chatId, content: text }));
      setText("");
    }
  };

  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="flex h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-t-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25 sm:h-[620px] sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Live chat
            </p>
            <h3 className="mt-1 text-lg font-bold text-slate-950">
              Rescue Chat
            </h3>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>

        <div
          ref={containerRef}
          className="flex-1 space-y-2 overflow-y-auto bg-slate-50 px-4 py-4"
        >
          {messages.map((m, i) => {
            if (m.system) {
              return (
                <div
                  key={i}
                  className="text-center text-xs italic text-slate-500"
                >
                  {m.message}
                </div>
              );
            }

            const isSelf = m.senderId === userId;
            return (
              <div
                key={i}
                className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-3 py-2 shadow-sm ${
                    isSelf
                      ? "rounded-br-sm bg-emerald-600 text-white"
                      : "rounded-bl-sm bg-white text-slate-900 ring-1 ring-slate-200"
                  }`}
                >
                  {!isSelf && (
                    <div className="mb-1 text-xs font-semibold text-slate-500">
                      {m.senderId}
                    </div>
                  )}
                  <div className="text-sm leading-5">{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t border-slate-100 bg-white p-4">
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleEnter}
              className="min-h-11 flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              placeholder="Type a message..."
            />
            <button
              onClick={sendMsg}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
