"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapIcon, X } from "lucide-react";
import { loadGoogleMaps } from "../lib/googleMaps";

const DEFAULT_CENTER = { lat: 7.8731, lng: 80.7718 };

export default function RescueReportForm({ onClose, onSubmit }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const [location, setLocation] = useState(""); // Plus Code
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [description, setDescription] = useState("");
  const [alertType, setAlertType] = useState("Medium");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(true);
  const [mapLoading, setMapLoading] = useState(true);
  const [mapError, setMapError] = useState("");

  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapsRef = useRef(null);

  const placeholderImage = "https://via.placeholder.com/400x300?text=No+Image";
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  //Get Plus Code from coordinates using Google Plus Codes API
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

  const placeMarker = (lat, lon) => {
    const maps = mapsRef.current;
    if (!maps || !mapRef.current) return;

    const position = { lat, lng: lon };
    if (!markerRef.current) {
      markerRef.current = new maps.Marker({
        position,
        map: mapRef.current,
      });
    } else {
      markerRef.current.setPosition(position);
    }

    mapRef.current.panTo(position);
    mapRef.current.setZoom(13);
  };

  useEffect(() => {
    if (!mapVisible) return;

    if (!GOOGLE_API_KEY) {
      setMapError("Google Maps API key is missing.");
      setMapLoading(false);
      return;
    }

    let mounted = true;

    loadGoogleMaps(GOOGLE_API_KEY)
      .then((maps) => {
        if (!mounted || !mapContainerRef.current) return;

        mapsRef.current = maps;

        if (!mapRef.current) {
          const map = new maps.Map(mapContainerRef.current, {
            center:
              coords.lat && coords.lon
                ? { lat: coords.lat, lng: coords.lon }
                : DEFAULT_CENTER,
            zoom: coords.lat ? 13 : 7,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
          });

          map.addListener("click", async (e) => {
            const lat = e.latLng.lat();
            const lon = e.latLng.lng();
            const plusCode = await getPlusCode(lat, lon);
            setCoords({ lat, lon });
            setLocation(plusCode);
            placeMarker(lat, lon);
          });

          mapRef.current = map;
        }

        if (coords.lat && coords.lon) {
          placeMarker(coords.lat, coords.lon);
        }

        if (
          maps.places &&
          autocompleteInputRef.current &&
          !autocompleteRef.current
        ) {
          autocompleteRef.current = new maps.places.Autocomplete(
            autocompleteInputRef.current,
          );
          autocompleteRef.current.addListener("place_changed", async () => {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry) return;

            const lat = place.geometry.location.lat();
            const lon = place.geometry.location.lng();
            const plusCode = await getPlusCode(lat, lon);
            setCoords({ lat, lon });
            setLocation(plusCode);
            placeMarker(lat, lon);
          });
        }

        setMapError("");
        setMapLoading(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setMapError(String(err));
        setMapLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [GOOGLE_API_KEY, coords.lat, coords.lon, mapVisible]);

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported in your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        const plusCode = await getPlusCode(lat, lon);
        setCoords({ lat, lon });
        setLocation(plusCode);
        setMapVisible(true);
        placeMarker(lat, lon);
      },
      (err) => alert("Failed to get location: " + err.message),
      { enableHighAccuracy: true },
    );
  };

  const handleToggleMap = () => {
    const nextVisible = !mapVisible;
    setMapVisible(nextVisible);

    if (nextVisible && mapRef.current && mapsRef.current) {
      window.setTimeout(() => {
        mapsRef.current.event.trigger(mapRef.current, "resize");
        mapRef.current.panTo(
          coords.lat && coords.lon
            ? { lat: coords.lat, lng: coords.lon }
            : DEFAULT_CENTER,
        );
      }, 0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let photoUrl = placeholderImage;

    if (photoFile) {
      const formData = new FormData();
      formData.append("file", photoFile);

      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(`${API_BASE}/rescue-rep/upload-s3`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) throw new Error("Failed to upload image");
        const data = await res.json();
        photoUrl = data.url;
      } catch (err) {
        console.error("Image upload failed, using placeholder", err);
      }
    }

    await onSubmit({
      location, // Plus Code
      plus_code: location,
      latitude: coords.lat,
      longitude: coords.lon,
      description,
      alert_type: alertType,
      photo: photoUrl,
      status: "Pending",
    });

    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 text-black backdrop-blur-sm sm:p-4">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25">
        <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Rescue report
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Report a Rescue
            </h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close rescue report"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-3 overflow-y-auto px-5 py-4 sm:px-6 md:grid-cols-2 md:gap-x-5"
        >
          {/* Location (Plus Code) */}
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-700">
              Location (Plus Code)
            </label>
            <input
              ref={autocompleteInputRef}
              type="text"
              placeholder="Search or click 'Use Current Location'"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2 md:col-span-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-2.5 text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-emerald-700"
            >
              <LocateFixed size={16} className="shrink-0" />
              <span>Use Current Location</span>
            </button>
            <button
              type="button"
              onClick={handleToggleMap}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-3 py-2.5 text-sm font-semibold leading-tight text-white shadow-sm transition hover:bg-orange-600"
            >
              <MapIcon size={16} className="shrink-0" />
              <span>{mapVisible ? "Hide Map" : "Select on Map"}</span>
            </button>
          </div>

          {/* Google Map */}
          <div className={mapVisible ? "block" : "hidden"}>
            <div className="relative h-52 overflow-hidden rounded-xl border border-slate-200 sm:h-56 md:h-full md:min-h-[310px]">
              <div ref={mapContainerRef} className="h-full w-full" />

              {(mapLoading || mapError) && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 px-4 text-center text-sm font-medium text-slate-500">
                  {mapError || "Loading map..."}
                </div>
              )}
            </div>
          </div>

          <div
            className={
              mapVisible
                ? "flex flex-col gap-3"
                : "flex flex-col gap-3 md:col-span-2"
            }
          >
            {/* Description */}
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Describe the situation (e.g., injured animal, trapped pet, etc.)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[96px] rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100 md:min-h-[132px]"
              required
            />

            {/* Alert Type */}
            <label className="text-sm font-medium text-gray-700">
              Alert Level
            </label>
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
            >
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Upload Image */}
            <label className="text-sm font-medium text-gray-700">
              Photo (optional)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhotoFile(e.target.files[0])}
              className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 text-sm text-slate-600"
            />
          </div>

          {/* Submit + Cancel */}
          <div className="mt-1 flex justify-end gap-2 border-t border-slate-100 pt-4 md:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
