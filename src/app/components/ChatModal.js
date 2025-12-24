"use client";
import { useEffect, useState, useRef } from "react";

export default function ChatModal({ chatId, onClose, wsUrl }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const wsRef = useRef(null);
  const containerRef = useRef(null);
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const userId = typeof window !== "undefined" ? localStorage.getItem("user_id") : "You";

  // Fetch previous messages on mount or chatId change
  useEffect(() => {
    if (!chatId || !token) return;

    fetch(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(console.error);
  }, [chatId, token]);

  // Setup WebSocket connection
  useEffect(() => {
    if (!chatId || !token) return;

    const ws = new WebSocket(`${wsUrl}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => ws.send(JSON.stringify({ type: "join_chat", chatId }));

    ws.onmessage = (ev) => {
      try {
        const payload = JSON.parse(ev.data);
        if ((payload.type === "message" || payload.type === "system") && payload.chatId === chatId) {
          setMessages(prev => [...prev, payload]);
        }
      } catch (e) {
        console.error("Failed to parse WS message", e);
      }
    };

    ws.onclose = () => console.log("WebSocket disconnected");

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "leave_chat", chatId }));
      }
      ws.close();
    };
  }, [chatId, token, wsUrl]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

//   const sendMsg = () => {
//     if (!text.trim()) return;

//     const ws = wsRef.current;
//     const msg = { chatId, content: text, senderId: userId, temp: true };
//     setMessages(prev => [...prev, msg]); // optimistic preview
//     setText("");

//     if (ws && ws.readyState === WebSocket.OPEN) {
//       ws.send(JSON.stringify({ type: "message", chatId, content: text }));
//     } else {
//       alert("WebSocket disconnected");
//     }
//   };

    const sendMsg = () => {
    if (!text.trim()) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "message", chatId, content: text }));
        setText(""); // clear input
    }
    };


  const handleEnter = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
      <div className="bg-white w-full max-w-md rounded-t-xl p-4 flex flex-col">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Rescue Chat</h3>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-200">Close</button>
        </div>

        {rescueReport &&
            rescueReport.userId === currentUserId &&
            rescueReport.status !== "Resolved" && (
                <button
                onClick={async () => {
                    await fetch(`${API_BASE}/rescue-rep/${rescueReport.reportId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ status: "Resolved" }),
                    });
                    alert("Marked as resolved!");
                    fetchRescueReport(); // refresh UI
                }}
                className="bg-green-600 text-white px-4 py-2 rounded mt-3"
                >
                Mark Rescue as Resolved
                </button>
            )}


        <div
          ref={containerRef}
          className="h-72 overflow-y-auto border rounded p-2 mb-3 bg-gray-50 flex flex-col gap-1"
        >
          {messages.map((m, i) => {
            if (m.system) return <div key={i} className="text-center text-xs text-gray-500 italic">{m.message}</div>;

            const isSelf = m.senderId === userId;
            return (
              <div key={i} className={`flex ${isSelf ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[75%] p-2 rounded ${isSelf ? "bg-blue-600 text-white" : "bg-gray-200 text-black"}`}>
                  {!isSelf && <div className="text-xs text-gray-600 mb-1">{m.senderId}</div>}
                  <div className="text-sm">{m.content}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleEnter}
            className="flex-1 border p-2 rounded resize-none"
            placeholder="Type a message..."
          />
          <button onClick={sendMsg} className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
        </div>
      </div>
    </div>
  );
}
