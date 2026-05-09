"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { LocateFixed, MapIcon, Search, UserSearch, X } from "lucide-react";
import LostCard from "../components/LostCard";
import NearbyLostPets from "../components/NearbyLostPets";
import FullPageLoader from "../components/FullPageLoader";
import {
  GoogleMap,
  Marker,
  useJsApiLoader,
  Autocomplete,
} from "@react-google-maps/api";

export default function LostFound() {
  const [showModal, setShowModal] = useState(false);
  const [showRadiusModal, setShowRadiusModal] = useState(false);
  const [formData, setFormData] = useState({
    pet_name: "",
    pet_type: "Dog",
    gender: "Unknown",
    description: "",
    location: "",
    latitude: null,
    longitude: null,
    photo: "",
    file: null,
    status: "Lost",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nearby, setNearby] = useState([]);
  const [radius, setRadius] = useState(10);
  const [loadingNearby, setLoadingNearby] = useState(true);
  const [mapVisible, setMapVisible] = useState(false);

  const [pageLoading, setPageLoading] = useState(true);

  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Default: Colombo

  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const API_URL = `${API_BASE}/lost-found/`;
  const S3_UPLOAD_URL =
    process.env.NEXT_PUBLIC_S3_UPLOAD_URL ||
    `${API_BASE}/lost-found/upload-s3?folder=lost-found`;

  const PLACEHOLDER_IMAGE =
    "https://via.placeholder.com/300x300?text=No+Image+Available";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Convert coordinates to Plus Code (fallback to lat/lon)
  const getPlusCode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://plus.codes/api?address=${lat},${lon}&email=noreply@demo.com`,
      );
      const data = await res.json();
      return (
        data?.plus_code?.global_code || `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      );
    } catch {
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  };

  // Manual input for location
  const handleLocationChange = (e) => {
    setFormData({ ...formData, location: e.target.value });
  };

  const autocompleteRef = useRef(null);

  const handlePlaceChanged = async () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lon = place.geometry.location.lng();
    const plusCode = await getPlusCode(lat, lon);

    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lon,
      location: plusCode,
    }));
    setMapCenter({ lat, lng: lon });
  };

  // Map click handler
  const handleMapClick = useCallback(async (e) => {
    if (!e?.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const plusCode = await getPlusCode(lat, lng);
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      location: plusCode,
    }));
  }, []);

  // Use browser geolocation
  const handleUseCurrentLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation not supported.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const plusCode = await getPlusCode(latitude, longitude);
        setFormData((prev) => ({
          ...prev,
          latitude,
          longitude,
          location: plusCode,
        }));
        setMapCenter({ lat: latitude, lng: longitude });
        setMapVisible(true);
      },
      () => setError("Unable to fetch current location."),
    );
  }, []);

  // Upload to S3
  const uploadToS3 = async (file) => {
    if (!file) return PLACEHOLDER_IMAGE;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(S3_UPLOAD_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("S3 upload failed");
      const data = await res.json();
      return data.url || PLACEHOLDER_IMAGE;
    } catch (err) {
      console.error("S3 upload error:", err);
      return PLACEHOLDER_IMAGE;
    }
  };

  // Submit lost pet report
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    if (!token) {
      setError("You must login first.");
      setSubmitting(false);
      return;
    }

    try {
      const photoUrl = formData.file
        ? await uploadToS3(formData.file)
        : formData.photo || PLACEHOLDER_IMAGE;

      const payload = { ...formData, photo: photoUrl };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to create report");
      setSuccess("Lost pet report submitted successfully!");

      setFormData({
        pet_name: "",
        pet_type: "Dog",
        gender: "Unknown",
        description: "",
        location: "",
        latitude: null,
        longitude: null,
        photo: "",
        file: null,
        status: "Lost",
      });
      setMapVisible(false);

      setTimeout(() => setShowModal(false), 1200);

      // Refresh nearby list after submitting a report
      fetchNearby();
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Fetch nearby lost pets
  const fetchNearby = useCallback(async () => {
    if (typeof window === "undefined" || !navigator.geolocation || !token) {
      setLoadingNearby(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setLoadingNearby(true);
          const res = await fetch(
            `${API_URL}nearby?lat=${latitude}&lon=${longitude}&radius_km=${radius}`,
            { headers: { Authorization: `Bearer ${token}` } },
          );
          if (!res.ok) throw new Error(`Failed to fetch nearby: ${res.status}`);
          const data = await res.json();
          setNearby(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Nearby fetch error:", err);
          setNearby([]);
        } finally {
          setLoadingNearby(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setLoadingNearby(false);
      },
      { enableHighAccuracy: true },
    );
  }, [API_URL, radius, token]);

  // Auto-fetch nearby pets when page loads

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await fetchNearby(); // wait for first nearby fetch to finish
      if (!cancelled) {
        setPageLoading(false); // hide full-page loader
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchNearby]);

  return (
    <div className="relative">
      {pageLoading && <FullPageLoader />}

      {/* Hero Section*/}
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
              <UserSearch className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  Lost & found
                </p>

                <h2 className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
                  Lost or Found a Pet? – Help them find their way home
                </h2>

                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Join a community of animal lovers working together to reunite
                  lost pets with their families.
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    Report Lost Pet
                  </button>

                  <button
                    onClick={() => setShowRadiusModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition flex items-center gap-2"
                  >
                    <Search className="w-4 h-4" /> Nearby Search
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
              Updated as new reports come in.
            </p>
          </div>
        </div>
      </section>

      {/* Nearby Lost Pets */}
      <NearbyLostPets pets={nearby} loading={loadingNearby} />

      {/* All Lost Pets */}
      <section className="py-8 m-auto px-10 bg-gradient-to-br from-stone-200 via-stone-100 to-amber-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🐾 All Missing Pets
        </h2>
        <LostCard showStatusBadge={true} />
      </section>

      {/* Report Lost Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/70 bg-white text-black shadow-2xl shadow-slate-950/25">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                  Lost & found
                </p>
                <h2 className="mt-1 text-xl font-semibold text-slate-950">
                  Report Lost Pet
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close lost pet report"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 overflow-y-auto px-6 py-5"
            >
              <input
                type="text"
                placeholder="Pet Name"
                value={formData.pet_name}
                onChange={(e) =>
                  setFormData({ ...formData, pet_name: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              />

              {/* Pet Type (Dropdown only) */}
              <select
                value={formData.pet_type}
                onChange={(e) =>
                  setFormData({ ...formData, pet_type: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                required
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
              </select>

              <select
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              >
                <option value="Unknown">Unknown</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>

              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                rows={3}
              />

              {/* Location Section */}
              <div>
                {/* <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  placeholder="Enter location manually"
                  value={formData.location}
                  onChange={handleLocationChange}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                 */}

                {isLoaded && mapVisible && (
                  <div className="h-64 w-full overflow-hidden rounded-xl border border-slate-200">
                    <GoogleMap
                      center={mapCenter}
                      zoom={10}
                      onClick={handleMapClick}
                      mapContainerStyle={{ width: "100%", height: "100%" }}
                    >
                      {formData.latitude && formData.longitude && (
                        <Marker
                          position={{
                            lat: formData.latitude,
                            lng: formData.longitude,
                          }}
                        />
                      )}
                    </GoogleMap>
                  </div>
                )}

                {isLoaded ? (
                  <Autocomplete
                    onLoad={(ac) => (autocompleteRef.current = ac)}
                    onPlaceChanged={handlePlaceChanged}
                  >
                    <input
                      type="text"
                      placeholder="Search location"
                      value={formData.location}
                      onChange={handleLocationChange}
                      className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    placeholder="Loading Google..."
                    value={formData.location}
                    onChange={handleLocationChange}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                  />
                )}
                <div className="mb-3 mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <LocateFixed size={16} className="shrink-0" />
                    <span>Use Current Location</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapVisible((prev) => !prev)}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                  >
                    <MapIcon size={16} className="shrink-0" />
                    <span>{mapVisible ? "Hide Map" : "Show Map"}</span>
                  </button>
                </div>

                {formData.latitude && formData.longitude && (
                  <p className="mt-2 text-sm text-gray-600">
                    📍 <strong>{formData.location}</strong>
                  </p>
                )}
              </div>

              {/* Image Upload */}
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    file: e.target.files?.[0] || null,
                  })
                }
                className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600"
              />

              {error && (
                <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                  {error}
                </p>
              )}
              {success && (
                <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                  {success}
                </p>
              )}

              <div className="sticky bottom-0 -mx-6 border-t border-slate-100 bg-white px-6 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {submitting ? "Submitting..." : "Submit Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Nearby Radius Modal */}
      {showRadiusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 text-black backdrop-blur-sm">
          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25">
            <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                  Nearby pets
                </p>
                <h3 className="mt-1 flex items-center gap-2 text-lg font-semibold text-slate-950">
                  <Search size={18} /> Adjust Search Radius
                </h3>
              </div>
              <button
                onClick={() => setShowRadiusModal(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close radius search"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5">
              <label className="block text-sm font-medium mb-2">
                Radius (in km)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowRadiusModal(false)}
                  className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowRadiusModal(false);
                    fetchNearby();
                  }}
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
