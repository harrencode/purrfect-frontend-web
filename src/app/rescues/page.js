"use client";
import { useCallback, useEffect, useState } from "react";
import { HeartHandshake, Search, X } from "lucide-react";
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

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_URL = `${API_BASE}/rescue-rep/`;
  // const token =
  //   typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const getToken = useCallback(
    () =>
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null,
    [],
  );

  /** Fetch all user rescue reports */

  const fetchMissions = useCallback(async () => {
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
  }, [API_URL, getToken]);

  /** Fetch nearby rescue reports based on user location */
  const fetchNearby = useCallback(async () => {
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
            { headers: { Authorization: `Bearer ${token}` } },
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
      { enableHighAccuracy: true },
    );
  }, [API_URL, getToken, radius]);

  /** Fetch both on mount (first load) */
  useEffect(() => {
    fetchMissions();
    fetchNearby();
  }, [fetchMissions, fetchNearby]);

  /** Handle creating a new rescue report */
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
                <HeartHandshake className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  AI-powered help
                </p>

                <h2 className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
                  Rescue, Heal, Hope - Every Life Matters
                </h2>

                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Every rescue begins with someone who cares. <br />
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

            <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
              Updated with new rescues and matches.
            </p>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 text-black backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Nearby rescues
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-950">
                  <Search size={18} /> Advanced Search
                </h3>
              </div>
              <button
                onClick={() => setShowAdvanced(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close advanced search"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm text-gray-700 mb-2">
                Search radius (km)
              </label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                min="1"
                max="100"
                className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowAdvanced(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplySearch}
                  className="rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
