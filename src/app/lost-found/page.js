"use client";

import { useState, useEffect, useCallback,useRef } from "react";
import { UserSearch, Search } from "lucide-react";
import LostCard from "../components/LostCard";
import NearbyLostPets from "../components/NearbyLostPets";
import FullPageLoader from "../components/FullPageLoader"; 
import { GoogleMap, Marker, useJsApiLoader, Autocomplete } from "@react-google-maps/api";


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

  const [pageLoading, setPageLoading] = useState(true);

  


  const [mapCenter, setMapCenter] = useState({ lat: 6.9271, lng: 79.8612 }); // Default: Colombo

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const API_URL = `${API_BASE}/lost-found/`;
  const S3_UPLOAD_URL =
  process.env.NEXT_PUBLIC_S3_UPLOAD_URL ||
  `${API_BASE}/lost-found/upload-s3?folder=lost-found`;

  const PLACEHOLDER_IMAGE =
    "https://via.placeholder.com/300x300?text=No+Image+Available";

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null;

  // Load Google Maps
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries: ["places"],
  });

  // Convert coordinates to Plus Code (fallback to lat/lon)
  const getPlusCode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://plus.codes/api?address=${lat},${lon}&email=noreply@demo.com`
      );
      const data = await res.json();
      return data?.plus_code?.global_code || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
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
      },
      () => setError("Unable to fetch current location.")
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
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!res.ok)
            throw new Error(`Failed to fetch nearby: ${res.status}`);
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
      { enableHighAccuracy: true }
    );
  }, [API_URL, radius, token]);

  // Auto-fetch nearby pets when page loads
 
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      await fetchNearby();          // wait for first nearby fetch to finish
      if (!cancelled) {
        setPageLoading(false);      // hide full-page loader
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
                  Join a community of animal lovers working together to reunite lost pets with their families.
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
      <section className="py-8 m-auto px-10 bg-yellow-50">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          🐾 All Missing Pets
        </h2>
        <LostCard showStatusBadge={true} />
      </section>

      {/* Report Lost Pet Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] overflow-y-auto p-6 relative text-black">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-black hover:text-gray-700 text-2xl"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold mb-4">Report Lost Pet</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Pet Name"
                value={formData.pet_name}
                onChange={(e) =>
                  setFormData({ ...formData, pet_name: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
                required
              />

              {/* Pet Type (Dropdown only) */}
              <select
                value={formData.pet_type}
                onChange={(e) =>
                  setFormData({ ...formData, pet_type: e.target.value })
                }
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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
                className="w-full border rounded px-3 py-2"
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

                {isLoaded && (
                  <div className="h-64 w-full border rounded-lg overflow-hidden">
                    <GoogleMap
                      center={mapCenter}
                      zoom={10}
                      onClick={handleMapClick}
                      mapContainerStyle={{ width: "100%", height: "100%"}}
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
                      className="w-full border rounded px-3 py-2 mb-2"
                    />
                  </Autocomplete>
                ) : (
                  <input
                    type="text"
                    placeholder="Loading Google..."
                    value={formData.location}
                    onChange={handleLocationChange}
                    className="w-full border rounded px-3 py-2 mb-2"
                  />
                )}
                <div className="flex gap-3 mb-3">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="bg-gray-200 hover:bg-gray-300 text-sm px-3 py-1 rounded"
                  >
                    Use Current Location
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
                className="w-full border rounded px-3 py-2"
              />

              {error && <p className="text-red-600 text-sm">{error}</p>}
              {success && <p className="text-green-600 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
              >
                {submitting ? "Submitting..." : "Submit Report"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nearby Radius Modal */}
      {showRadiusModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded-xl shadow-xl w-80 p-6">
            <h3 className="text-lg font-semibold mb-4">Adjust Search Radius</h3>
            <label className="block text-sm font-medium mb-2">
              Radius (in km)
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full border rounded px-3 py-2 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowRadiusModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-full hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowRadiusModal(false);
                  fetchNearby();
                }}
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
