"use client";

import { Trophy, PawPrint, HeartHandshake, Search, MapPin  } from "lucide-react";

export default function Leaderboard() {
  const leaderboardData = [
    {
      id: 1,
      name: "Ayesha Perera",
      score: 1560,
      lastActive: "1 hour ago",
      rescues: 22,
      adoptions: 9,
      lostPets: 6,
      mapContributions: 15,
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: 2,
      name: "Ravi Fernando",
      score: 1420,
      lastActive: "3 hours ago",
      rescues: 18,
      adoptions: 7,
      lostPets: 5,
      mapContributions: 12,
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: 3,
      name: "Nimali Jayasuriya",
      score: 1390,
      lastActive: "5 hours ago",
      rescues: 17,
      adoptions: 6,
      lostPets: 4,
      mapContributions: 10,
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      id: 4,
      name: "Kamal Silva",
      score: 1320,
      lastActive: "6 hours ago",
      rescues: 15,
      adoptions: 5,
      lostPets: 3,
      mapContributions: 9,
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
    {
      id: 5,
      name: "Tharushi Dissanayake",
      score: 1280,
      lastActive: "8 hours ago",
      rescues: 14,
      adoptions: 4,
      lostPets: 2,
      mapContributions: 8,
      avatar: "https://randomuser.me/api/portraits/women/5.jpg",
    },
    {
      id: 6,
      name: "Nuwan Perera",
      score: 1240,
      lastActive: "10 hours ago",
      rescues: 13,
      adoptions: 3,
      lostPets: 2,
      mapContributions: 7,
      avatar: "https://randomuser.me/api/portraits/men/6.jpg",
    },
    {
      id: 7,
      name: "Harendra Kumarasiri",
      score: 1200,
      lastActive: "2 hours ago",
      rescues: 12,
      adoptions: 3,
      lostPets: 2,
      mapContributions: 6,
      avatar: "https://randomuser.me/api/portraits/men/7.jpg",
    },
    {
      id: 8,
      name: "Dilani Weerasinghe",
      score: 1180,
      lastActive: "12 hours ago",
      rescues: 11,
      adoptions: 2,
      lostPets: 1,
      mapContributions: 5,
      avatar: "https://randomuser.me/api/portraits/women/8.jpg",
    },
    {
      id: 9,
      name: "Sahan Jayawardena",
      score: 1150,
      lastActive: "14 hours ago",
      rescues: 10,
      adoptions: 2,
      lostPets: 1,
      mapContributions: 4,
      avatar: "https://randomuser.me/api/portraits/men/9.jpg",
    },
    {
      id: 10,
      name: "Ishara Fernando",
      score: 1120,
      lastActive: "16 hours ago",
      rescues: 9,
      adoptions: 1,
      lostPets: 1,
      mapContributions: 3,
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
    },
  ];

  const currentUser = leaderboardData.find((user) => user.name === "Harendra Kumarasiri");
  const sortedLeaderboard = [...leaderboardData].sort((a, b) => b.score - a.score);
  const currentUserIndex = sortedLeaderboard.findIndex(user => user.name === "Harendra Kumarasiri");
  const currentUserRank = currentUserIndex + 1;


  return (
    <div className="bg-gray-400">
      {/* Hero Section */}
      <section
        className="relative w-full h-[400px] flex items-center justify-center bg-white bg-center"
        style={{
          backgroundImage: "url('/images/hero-image.png')",
        }}
      >
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md px-8 py-6 max-w-3xl w-[90%] flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <Trophy className="w-20 h-20 text-black" />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-black">
              Champions – See Who's Making a Difference
            </h2>
            <p className="text-gray-800 text-sm mt-2">
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
      </section>

      {/* Leaderboard Section */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {/* Current User Summary */}
        <div className="mb-6 bg-white dark:bg-white backdrop-blur-lg rounded-lg shadow p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-16 h-16 rounded-full object-cover" />
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-black">
                {currentUser.name} <span className="text-sm text-green-800 font-medium">(Rank #{currentUserRank})</span>
                </h3>

                <p className="text-sm text-gray-600 dark:text-black">
                Score: <span className="font-bold text-indigo-600">{currentUser.score}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-black">Last Active: {currentUser.lastActive}</p>

                <div className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-19 w-full text-sm text-gray-700 dark:text-black">
                    <div className="flex items-center gap-3">
                        <PawPrint className="w-5 h-5 min-w-[20px] min-h-[20px] text-orange-500" />
                        <span>Rescues Helped: <strong>{currentUser.rescues}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <HeartHandshake className="w-5 h-5 min-w-[20px] min-h-[20px] text-pink-500" />
                        <span>Adoptions Facilitated: <strong>{currentUser.adoptions}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Search className="w-5 h-5 min-w-[20px] min-h-[20px] text-blue-500" />
                        <span>Lost Pets Found: <strong>{currentUser.lostPets}</strong></span>
                    </div>
                    <div className="flex items-center gap-3">
                        <MapPin className="w-5 h-5 min-w-[20px] min-h-[20px] text-green-600" />
                        <span>Stray Map Contributions: <strong>{currentUser.mapContributions}</strong></span>
                    </div>
                </div>
            </div>
        </div>


        {/* Leaderboard Table */}
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rescues</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Adoptions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Lost Pets</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Map Contributions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {leaderboardData.map((user, index) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-600">{index + 1}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                  <td className="px-6 py-4 text-sm text-indigo-600 font-semibold">{user.score}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">{user.lastActive}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.rescues}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.adoptions}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.lostPets}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{user.mapContributions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
