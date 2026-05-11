// components/Notifications.jsx
"use client";
import { useEffect, useState } from "react";

export default function Notifications({ wsUrl }) {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;
    const url = `${wsUrl}?token=${token}`;
    const ws = new WebSocket(url);
    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "notification") {
          setNotifications((p) => [data, ...p].slice(0, 20));
        }
      } catch (e) {}
    };
    setSocket(ws);
    return () => ws.close();
  }, [wsUrl]);

  if (!notifications.length) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-auto sm:w-80 sm:right-4">
      {notifications.map((n, idx) => (
        <div key={idx} className="bg-white p-3 rounded shadow mb-2">
          <div className="text-sm font-semibold">{n.from || "System"}</div>
          <div className="text-xs">{n.content}</div>
        </div>
      ))}
    </div>
  );
}
