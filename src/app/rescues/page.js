"use client";
import { useState, useEffect } from "react";
import { HeartHandshake, Search } from "lucide-react";
import RescueMissions from "../components/RescueMissions";
import RescueReportForm from "../components/RescueReportForm";
import RescueMissionsNearby from "../components/RescueMissionsNearby";
import FullPageLoader from "../components/FullPageLoader";


export default function Rescues() {
  const [showForm, setShowForm] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);


  // const [missions, setMissions] = useState([]);
  // const [nearby, setNearby] = useState([]);
  const [radius, setRadius] = useState(10);
  const [missions, setMissions] = useState([]);
  const [nearby, setNearby] = useState([]);

  const [loadingMissions, setLoadingMissions] = useState(true);
  const [loadingNearby, setLoadingNearby] = useState(true);

  const [errorMissions, setErrorMissions] = useState("");
  const [errorNearby, setErrorNearby] = useState("");


  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState("");

  const pageLoading = loadingMissions || loadingNearby;

  const API_URL = "http://localhost:8000/rescue-rep/";
  // const token =
  //   typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const getToken = () =>
  (typeof window !== "undefined" ? localStorage.getItem("access_token") : null);

  /** Fetch all user rescue reports */
 

  const fetchMissions = async () => {
    const token = getToken();
    if (!token) {
      setMissions([]);
      setLoadingMissions(false);
      setErrorMissions("Login to see your missions.");
      return;
    }

    try {
      setLoadingMissions(true);
      setErrorMissions("");

      const res = await fetch(API_URL, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      setMissions(data);
    } catch (err) {
      setErrorMissions(err.message || "Failed to load missions.");
      setMissions([]);
    } finally {
      setLoadingMissions(false);
    }
  };


  


  /** Fetch nearby rescue reports based on user location */
  const fetchNearby = async () => {
    const token = getToken();

    if (!token) {
      setErrorNearby("Login to see nearby rescue missions.");
      setNearby([]);
      setLoadingNearby(false);
      return;
    }

    if (typeof window === "undefined" || !navigator.geolocation) {
      setErrorNearby("Geolocation not available in this browser.");
      setNearby([]);
      setLoadingNearby(false);
      return;
    }

    setLoadingNearby(true);
    setErrorNearby("");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;

        try {
          const res = await fetch(
            `${API_URL}nearby?lat=${latitude}&lon=${longitude}&radius_km=${radius}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (!res.ok) throw new Error(`Failed to fetch nearby: ${res.status}`);

          const data = await res.json();
          setNearby(data);
        } catch (err) {
          console.error(err);
          setErrorNearby("Could not load nearby missions.");
          setNearby([]);
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setErrorNearby("Location access denied. Cannot load nearby missions.");
        setNearby([]);
        setLoadingNearby(false);
      },
      { enableHighAccuracy: true }
    );
  };






  /** Fetch both on mount (first load) */
  useEffect(() => {
    fetchMissions();
    fetchNearby();
  }, []);

  /** 🐾 Handle creating a new rescue report */
  const handleCreateRescueReport = async (reportData) => {
    const token = getToken();
    if (!token) return alert("You must login first");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reportData),
      });
      if (!res.ok) throw new Error(`Failed to create report: ${res.status}`);

      const newReport = await res.json();
      // Instantly add new rescue to UI
      setMissions((prev) => [newReport, ...prev]);
      setShowForm(false);

      // Fetch nearby again (in case user’s location is close)
      await fetchNearby();

      alert("Rescue report submitted successfully!");
    } catch (err) {
      alert(err.message);
    }
  };

  /** Handle Advanced Search (just updates nearby rescues) */
  const handleApplySearch = async () => {
    setShowAdvanced(false);
    await fetchNearby(); // only refresh nearby rescues
  };

  return (
    // <div>
    <div className="relative">
      {pageLoading && <FullPageLoader />}
      
      {/* Hero Section */}
      <section
        className="relative w-full h-[400px] flex items-center justify-center bg-white bg-center"
        style={{ backgroundImage: "url('/images/hero-image.png')" }}
      >
        <div className="bg-white/40 backdrop-blur-md rounded-2xl shadow-md px-8 py-6 max-w-3xl w-[90%] flex flex-col md:flex-row items-center gap-6">
          <div className="flex-shrink-0">
            <HeartHandshake className="w-20 h-20 text-black" />
          </div>
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h2 className="text-xl md:text-2xl font-semibold text-black">
              Rescue, Heal, Hope - Every Life Matters
            </h2>
            <p className="text-gray-800 text-sm mt-2">
              Every rescue begins with someone who cares.<br />
              AI powered search to find the best match.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition"
              >
                Report a Rescue
              </button>
              <button
                onClick={() => setShowAdvanced(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Advanced Search
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Nearby Missions */}
      {/* <RescueMissionsNearby missions={nearby} loading={loading} error={error} refresh={fetchNearby} /> */}

      {/* Your Missions */}
      {/* <RescueMissions missions={missions} loading={loading} error={error} refresh={fetchMissions} /> */}

      <RescueMissionsNearby
        missions={nearby}
        loading={loadingNearby}
        error={errorNearby}
        refresh={fetchNearby}
      />

      <RescueMissions
        missions={missions}
        loading={loadingMissions}
        error={errorMissions}
        refresh={fetchMissions}
      />


      {/* Rescue Report Modal */}
      {showForm && (
        <RescueReportForm
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateRescueReport}
        />
      )}

      {/* Advanced Search Modal */}
      {showAdvanced && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Advanced Search
            </h3>
            <label className="block text-sm text-gray-700 mb-2">
              Search radius (km)
            </label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              min="1"
              max="100"
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowAdvanced(false)}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApplySearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
