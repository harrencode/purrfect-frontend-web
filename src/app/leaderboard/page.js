
"use client";

import { useEffect, useState } from "react";
import { Trophy, PawPrint, HeartHandshake, Search, MapPin } from "lucide-react";
import FullPageLoader from "../components/FullPageLoader";
import Image from "next/image";

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUserName, setCurrentUserName] = useState("");

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);
  const [error, setError] = useState(null);

  const pageLoading = loadingUser || loadingLeaderboard;

  // Fetch current user using access token
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoadingUser(true);
      const token = typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;

      if (!token) {
        console.warn("No access token found in localStorage");
        setLoadingUser(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:8000/users/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch user info");

        const user = await res.json();
        console.log("Fetched current user:", user);

        if (user.first_name && user.last_name) {
          setCurrentUserName(`${user.first_name} ${user.last_name}`);
        }
      } catch (err) {
        console.error("Error fetching user from token:", err);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // ✅ Fetch leaderboard data
  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoadingLeaderboard(true);
        setError(null);

        const res = await fetch("http://localhost:8000/leaderboard/");
        if (!res.ok) throw new Error("Failed to fetch leaderboard");

        const data = await res.json();
        setLeaderboardData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Format “Last Active” time difference
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp.replace(" ", "T"));
    if (isNaN(date.getTime())) return timestamp;
    const diffMs = Date.now() - date.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  };

  // Sort and find current user
  const sortedLeaderboard = [...leaderboardData].sort(
    (a, b) => b.score - a.score
  );

  const currentUser = sortedLeaderboard.find(
    (entry) =>
      entry.full_name &&
      currentUserName &&
      entry.full_name.trim().toLowerCase() ===
        currentUserName.trim().toLowerCase()
  );

  const currentUserRank = currentUser
    ? sortedLeaderboard.indexOf(currentUser) + 1
    : null;

  return (
    <div className="relative bg-gray-400 min-h-screen">
      {/* Full-page loader overlay */}
      {pageLoading && <FullPageLoader />}

      {/* Hero Section (updated to match home hero background style) */}
      <section className="relative w-full min-h-[400px] overflow-hidden flex items-center">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-image.png')" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 py-10 sm:py-14 md:py-16 flex justify-center">
          <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/70 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-shrink-0">
                <Trophy className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  Community impact
                </p>

                <h2 className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
                  Champions – See Who&apos;s Making a Difference
                </h2>

                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Every point earned reflects a real-world impact. <br />
                  Explore the leaderboard and celebrate the heroes driving change in our rescue community.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                  <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition">
                    Activity Log
                  </button>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition">
                    Search
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
              Updated from live leaderboard activity.
            </p>
          </div>
        </div>
      </section>


      {/* Global error (if any) */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-6">
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            Error loading leaderboard: {error}
          </div>
        </div>
      )}

      {/* Current User Summary */}
      {currentUser && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-6 bg-white backdrop-blur-lg rounded-lg shadow p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <Image
              src={currentUser.avatar || "/images/default-avatar.png"}
              alt={currentUser.full_name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex flex-col gap-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentUser.full_name}{" "}
                <span className="text-sm text-green-800 font-medium">
                  (Rank #{currentUserRank})
                </span>
              </h3>
              <p className="text-sm text-gray-600">
                Score:{" "}
                <span className="font-bold text-indigo-600">
                  {currentUser.score}
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Last Active: {formatTimeAgo(currentUser.last_active)}
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 text-sm text-gray-700">
                <div className="flex items-center gap-3">
                  <PawPrint className="w-5 h-5 text-orange-500" />
                  <span>
                    Rescues Helped: <strong>{currentUser.rescues}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <HeartHandshake className="w-5 h-5 text-pink-500" />
                  <span>
                    Adoptions Facilitated:{" "}
                    <strong>{currentUser.adoptions}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-blue-500" />
                  <span>
                    Lost Pets Found:{" "}
                    <strong>{currentUser.lost_pets}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <span>
                    Stray Map Contributions:{" "}
                    <strong>{currentUser.map_contributions}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard Table */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="overflow-x-auto rounded-lg shadow bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {[
                  "Rank",
                  "Profile",
                  "Name",
                  "Score",
                  "Last Active",
                  "Rescues",
                  "Adoptions",
                  "Lost Pets",
                  "Map Contributions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedLeaderboard.map((user, index) => (
                <tr
                  key={user.id}
                  className={
                    currentUserName &&
                    user.full_name?.trim().toLowerCase() ===
                      currentUserName.trim().toLowerCase()
                      ? "bg-indigo-50"
                      : ""
                  }
                >
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Image
                      src={user.avatar || "/images/default-avatar.png"}
                      alt={user.full_name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {user.full_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">
                    {user.score}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatTimeAgo(user.last_active)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.rescues}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.adoptions}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.lost_pets}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {user.map_contributions}
                  </td>
                </tr>
              ))}

              {sortedLeaderboard.length === 0 && !pageLoading && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-6 text-center text-sm text-gray-500"
                  >
                    No leaderboard data available yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
