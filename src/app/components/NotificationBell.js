"use client";

import { useEffect, useRef, useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Fetch notifications periodically
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const token = Cookies.get("access_token");
        if (!token) return;

        const res = await fetch(`${API_BASE}/notifications/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch notifications");

        const data = await res.json();
        const sorted = data.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setNotifications(sorted);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark as viewed + redirect
  const handleClick = async (notif) => {
    try {
      const token = Cookies.get("access_token");
      await fetch(
        `${API_BASE}/notifications/${notif.notif_id}/viewed`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Locally mark it as viewed (immediate UI feedback)
      setNotifications((prev) =>
        prev.map((n) =>
          n.notif_id === notif.notif_id ? { ...n, viewed: true } : n
        )
      );

      // Navigate
      if (notif.notif_type === "rescue") router.push(`/chats/${notif.chat_id}`);
      else if (notif.notif_type === "lostpet")
        router.push(`/lost-found/${notif.chat_id}`);
    } catch (err) {
      console.error("Failed to mark notification viewed:", err);
    }
  };

  // Red dot should only show if ANY are unread
  const unreadCount = notifications.filter((n) => !n.viewed).length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative rounded-full p-2 text-gray-100 hover:text-teal-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-400 transition"
      >
        <span className="sr-only">View notifications</span>
        <BellIcon className="w-6 h-6" aria-hidden="true" />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-gray-800">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-2xl bg-gray-900 border border-gray-700 ring-1 ring-black ring-opacity-5 z-50 backdrop-blur-md">
          <div className="p-3 max-h-96 overflow-y-auto text-white">
            <h3 className="text-sm font-semibold text-teal-300 mb-2">
              Notifications
            </h3>

            {loading && (
              <p className="text-gray-400 text-sm animate-pulse">
                Loading notifications...
              </p>
            )}

            {!loading && notifications.length === 0 && (
              <div className="rounded-xl border border-gray-700 bg-gray-800/80 p-3 text-center text-sm text-gray-300">
                <p className="font-semibold text-gray-100">All caught up</p>
                <p className="mt-1 text-xs text-gray-400">
                  New alerts will show up here.
                </p>
              </div>
            )}

            <ul className="divide-y divide-gray-700">
              {notifications.map((notif) => (
                <li
                  key={notif.notif_id}
                  onClick={() => handleClick(notif)}
                  className={`cursor-pointer p-3 rounded-lg transition-all duration-200 ${
                    notif.viewed
                      ? "bg-gray-800 text-gray-400"
                      : "bg-teal-600/20 text-white border border-teal-500/30"
                  } hover:bg-teal-700/30 hover:text-white`}
                >
                  <p className="text-sm font-medium">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
