

"use client";

import { useEffect, useState } from "react";
import { PawPrint, HeartHandshake, UserSearch, Store, MapPin, PawPrint as Paw } from "lucide-react";
import HeroSection from "./components/HeroSection";
import Map from "./components/Map";
import FullPageLoader from "./components/FullPageLoader";
import Image from "next/image";


const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
// const RESCUE_API = "http://localhost:8000/rescue-rep/";
const RESCUE_API = `${API_BASE}/rescue-rep/`;

export default function Home() {
  const [recommendedPets, setRecommendedPets] = useState([]);
  const [adoptionReqs, setAdoptionReqs] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  // Nearby rescues for Alerts section
  const [nearbyMissions, setNearbyMissions] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [nearbyError, setNearbyError] = useState("");

  const pageLoading = loadingRecs || nearbyLoading;


  // const token =
  //   typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const getToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null;


  //  Safe nested property getter
  const safe = (obj, path, fallback) =>
    path.reduce((a, k) => (a && a[k] != null ? a[k] : fallback), obj);

  // Fetch recommended pets
  const fetchRecommendedPets = async (top_k = 4) => {
    const token = getToken();
    if (!token) return;
    try {
      setLoadingRecs(true);
      const res = await fetch(`${API_BASE}/recommend/?top_k=${top_k}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recommended pets");
      const data = await res.json();
      setRecommendedPets(data.recommendations || []);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecs(false);
    }
  };

  // Fetch adoption requests (for linking to recommendation data)
  const fetchAdoptionReqs = async () => {
    const token = getToken();
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/adoption_reqs/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch adoption requests");
      const data = await res.json();
      setAdoptionReqs(data || []);
    } catch (err) {
      console.error("Error fetching adoption requests:", err);
    }
  };

  

  // const fetchNearbyRescues = async (radiusKm = 10) => {
  //   const token = getToken();

  //   if (!token) {
  //     setNearbyLoading(false);
  //     setNearbyError("Login to see rescue alerts near you.");
  //     setNearbyMissions([]);
  //     return;
  //   }

  //   if (typeof window === "undefined" || !navigator.geolocation) {
  //     setNearbyLoading(false);
  //     setNearbyError("Geolocation not available.");
  //     setNearbyMissions([]);
  //     return;
  //   }

  //   setNearbyLoading(true);
  //   setNearbyError("");

  //   navigator.geolocation.getCurrentPosition(
  //     async (pos) => {
  //       const { latitude, longitude } = pos.coords;
  //       try {
  //         const res = await fetch(
  //           `${RESCUE_API}nearby?lat=${latitude}&lon=${longitude}&radius_km=${radiusKm}`,
  //           {
  //             headers: { Authorization: `Bearer ${token}` },
  //           }
  //         );

  //         if (!res.ok) {
  //           throw new Error(`Failed to fetch nearby rescues: ${res.status}`);
  //         }

  //         const data = await res.json();
  //         setNearbyMissions(data || []);
  //       } catch (err) {
  //         console.error(err);
  //         setNearbyError("Could not load nearby rescue alerts.");
  //         setNearbyMissions([]);
  //       } finally {
  //         setNearbyLoading(false);
  //       }
  //     },
  //     (err) => {
  //       console.error("Geolocation error:", err);
  //       setNearbyError("Location access denied. Cannot load nearby alerts.");
  //       setNearbyMissions([]);
  //       setNearbyLoading(false);
  //     },
  //     { enableHighAccuracy: true }
  //   );
  // };

  const fetchNearbyRescues = async (radiusKm = 10) => {
  const token = getToken();

  if (!token) {
    setNearbyLoading(false);
    setNearbyError("Login to see rescue alerts near you.");
    setNearbyMissions([]);
    return;
  }

  // Skip geolocation if not secure or unavailable
  if (
    typeof window === "undefined" ||
    !window.isSecureContext ||
    !("geolocation" in navigator)
  ) {
    console.warn(
      "Geolocation not available here (needs HTTPS or localhost). Nearby alerts disabled."
    );
    setNearbyLoading(false);
    setNearbyError(
      "Location isn't available on this connection. Nearby alerts are disabled."
    );
    setNearbyMissions([]);
    return;
  }

  setNearbyLoading(true);
  setNearbyError("");

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(
          `${RESCUE_API}nearby?lat=${latitude}&lon=${longitude}&radius_km=${radiusKm}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch nearby rescues: ${res.status}`);
        }

        const data = await res.json();
        setNearbyMissions(data || []);
      } catch (err) {
        console.error(err);
        setNearbyError("Could not load nearby rescue alerts.");
        setNearbyMissions([]);
      } finally {
        setNearbyLoading(false);
      }
    },
    (err) => {
      console.warn("Geolocation error:", err?.message ?? err);
      setNearbyError("Location access denied. Cannot load nearby alerts.");
      setNearbyMissions([]);
      setNearbyLoading(false);
    },
    { enableHighAccuracy: true }
  );
};





  // useEffect(() => {
  //   fetchRecommendedPets();
  //   fetchAdoptionReqs();
  //   fetchNearbyRescues();
  // }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await Promise.all([fetchRecommendedPets(), fetchAdoptionReqs()]);
      if (!cancelled) {
        await fetchNearbyRescues();
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);


  // Start/Join rescue chat from Alerts section
  const startRescueFromAlert = async (mission) => {
    const token = getToken();
    // const token = localStorage.getItem("access_token");
    if (!token) return alert("Login first");

    try {
      const reportId = mission.reportId;
      if (!reportId) throw new Error("Missing report ID");

      let chatId = mission.chatId;

      // If no chat exists yet → create one
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

        if (!chatRes.ok) throw new Error("Failed to create rescue chat");

        const chatData = await chatRes.json();
        chatId = chatData.chatId;

        // Update report with chat id and maybe status
        const updateBody =
          mission.status === "Pending"
            ? { chat_id: chatId, status: "InProgress" }
            : { chat_id: chatId };

        const updateRes = await fetch(`${RESCUE_API}${reportId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updateBody),
        });

        if (!updateRes.ok) throw new Error("Failed to update rescue report");
      } else if (mission.status === "Pending") {
        // If chat exists but status still Pending → move to InProgress
        const updateRes = await fetch(`${RESCUE_API}${reportId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "InProgress" }),
        });
        if (!updateRes.ok) throw new Error("Failed to update status");
      }

      // Optional: refresh alerts after click
      fetchNearbyRescues();

      if (chatId) window.open(`/chats/${chatId}`, "_blank");
    } catch (err) {
      console.error(err);
      alert(err.message || "Unable to open rescue chat.");
    }
  };

  // Start adoption chat (unchanged)
  const startChat = async (adoptionReqId) => {
    const token = getToken();
    if (!token) return alert("Please sign in to start a chat.");
    try {
      const res = await fetch(`${API_BASE}/chats/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chat_type: "adoption",
          related_entity_id: adoptionReqId,
        }),
      });
      if (!res.ok) throw new Error("Failed to start chat");
      const chat = await res.json();
      window.open(
        `/adoptions/${chat.chatId}?adoptionReqId=${adoptionReqId}`,
        "_blank"
      );
    } catch (err) {
      console.error("Error starting chat:", err);
      alert("Unable to open chat. Please try again.");
    }
  };

  return (
    // <div>
    <div className="relative">
      {pageLoading && <FullPageLoader />}
      {/* Hero Section */}
      <HeroSection />

      {/* Main Navigation Cards */}
      <section className="py-10 bg-red-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
            {[
              { icon: PawPrint, text: "Report a Rescue", link: "/rescues" },
              { icon: HeartHandshake, text: "Adopt a Pet", link: "/adoptions" },
              { icon: UserSearch, text: "Lost & Found", link: "/lost-found" },
              { icon: Store, text: "Store", link: "/store" },
            ].map(({ icon: Icon, text, link }) => (
              <div
                key={text}
                className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300 w-full max-w-xs"
              >
                <Icon className="w-20 h-20 text-black mx-auto mb-4" />
                <a
                  href={link}
                  className="text-black hover:text-orange-600 hover:underline text-lg font-semibold"
                >
                  {text}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Recommended Pets  */}
      {/* EVERYTHING BELOW HERE IS UNCHANGED UNTIL ALERTS SECTION*/}

      <section>
        <h1 className="bg-orange-100 text-black text-center text-2xl font-semibold py-5">
          AI Recommended Pets for You
        </h1>

        {loadingRecs && (
          <p className="text-center text-gray-600 mb-4 animate-pulse">
            🔄 Refreshing recommendations...
          </p>
        )}

        <div className="flex flex-wrap justify-center gap-6 p-6 bg-orange-100">
          {!loadingRecs && recommendedPets.length === 0 && (
            <p className="text-gray-500 text-sm">
              No recommendations available yet.
            </p>
          )}

          {recommendedPets.map((pet) => {
            const req = adoptionReqs.find(
              (r) => safe(r, ["pet", "pet_id"], null) === pet.pet_id
            );
            if (!req) return null;

            const statusColor =
              req.status === "Completed"
                ? "bg-green-100 text-green-700 border border-green-400"
                : req.status === "Pending"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                : "bg-blue-100 text-blue-700 border border-blue-400";

            return (
              <div
                key={req.id}
                className="group relative flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-2xl border border-gray-200 rounded-2xl w-80 transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300 overflow-hidden"
              >
                {/* Pet Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={
                      safe(req, ["pet", "images", 0]) ||
                      "https://placehold.co/300x300?text=No+Image"
                    }
                    alt={safe(req, ["pet", "name"], "Unknown")}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-orange-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                    {req?.pet?.species || "Pet"}
                  </div>
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md cursor-default ${statusColor}`}
                    >
                      {req.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h6 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      {req.pet.name || "Unknown"}{" "}
                      <span className="text-sm text-gray-400">
                        ({req.pet.species || "Pet"})
                      </span>
                    </h6>
                    <p className="text-sm text-gray-600">
                      {req.pet.gender || "Unknown"} • {req.pet.age || 0} years
                      old
                    </p>
                    {req.pet.description && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {req.pet.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => startChat(req.id)}
                    disabled={req.status === "Completed"}
                    className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition ${
                      req.status === "Completed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-400 hover:to-pink-400 text-white shadow-md"
                    }`}
                  >
                    {req.status === "Completed" ? "Adopted" : "Ask to Adopt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Map & Alerts */}
      <section className="px-10 bg-green-100">
        <div className="flex flex-row w-full h-[80vh]">
          {/* Map */}
          <div className="basis-1/2 bg-green-100 p-4">
            <h1 className="text-black text-2xl font-bold mb-4">
              Purr-fect Stray Locator
            </h1>
            <div id="map" className="w-full h-auto rounded-lg shadow-md">
              <Map />
            </div>
          </div>

          {/* Alerts – now powered by nearby rescue missions */}
          
          <div className="basis-1/2 bg-green-100 p-4 flex flex-col">
            <h1 className="text-black text-2xl font-bold mb-4">
              Rescue Alerts Near You
            </h1>

            {/* only this part scrolls */}
            {/* <div className="flex-1 overflow-y-auto"> */}
            <div className="overflow-y-auto" style={{ height: "400px" }}>

              {nearbyLoading && (
                <p className="text-sm text-gray-700">Loading nearby alerts...</p>
              )}

              {nearbyError && (
                <p className="text-sm text-red-600 mb-3">{nearbyError}</p>
              )}

              {!nearbyLoading && !nearbyError && nearbyMissions.length === 0 && (
                <p className="text-sm text-gray-700">
                  No rescue alerts near you right now.
                </p>
              )}

              <div className="space-y-4">
                {nearbyMissions.slice(0, 10).map((mission) => (
                  <div
                    key={mission.reportId}
                    onClick={() => startRescueFromAlert(mission)}
                    className="bg-white rounded-lg shadow p-4 hover:bg-gray-50 transition cursor-pointer"
                  >
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Paw className="w-4 h-4" />
                      {mission.distance_km != null
                        ? `${mission.distance_km.toFixed(1)} km away`
                        : "Nearby"}
                    </p>
                    <h2 className="text-lg font-semibold text-gray-800 mt-1">
                      {mission.alert_type || "Rescue Needed"}
                    </h2>
                    <p className="text-sm text-red-600">
                      {mission.status || "Pending"}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {mission.location}
                    </p>
                    {mission.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {mission.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      Click to open rescue chat
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>





        </div>
      </section>
    </div>
  );
}
