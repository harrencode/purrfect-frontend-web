"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Autocomplete } from "@react-google-maps/api";
import { LocateFixed, MapPin, Navigation, Save, X } from "lucide-react";
import { loadGoogleMaps } from "../lib/googleMaps";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });
const GOOGLE_LIBRARIES = ["places"];

const typeLabels = {
  StrayAnimal: "Stray Animal",
  RescueHome: "Rescue Home",
  VetCenter: "Vet Center",
};

export default function FormModal({ type, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_info: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [showMap, setShowMap] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [mapCenter, setMapCenter] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapsError, setMapsError] = useState("");

  const autocompleteRef = useRef(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const handleLoadMaps = async () => {
    if (mapsLoaded || mapsError) return;

    try {
      await loadGoogleMaps(GOOGLE_API_KEY, GOOGLE_LIBRARIES);
      setMapsLoaded(true);
      setMapsError("");
    } catch (err) {
      setMapsError(err.message);
    }
  };

  const typeMap = {
    StrayAnimal: "stray_animal",
    RescueHome: "rescue_home",
    VetCenter: "vet_center",
  };

  const handleChange = (e) => {
    setAddressError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const getPlusCode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://plus.codes/api?address=${lat},${lng}&email=noreply@demo.com`,
      );
      const data = await res.json();
      return (
        data?.plus_code?.global_code || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      );
    } catch {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  const handlePlaceChanged = async () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry) {
      setAddressError("Please select a location from the list.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    const plus = await getPlusCode(lat, lng);

    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: plus,
    }));
    setMapCenter({ lat, lng });
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const plus = await getPlusCode(lat, lng);
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: plus,
        }));
        setMapCenter({ lat, lng });
      },
      (err) => alert("Failed: " + err.message),
    );
  };

  const handleMapSelect = async ({ lat, lng }) => {
    const plus = await getPlusCode(lat, lng);
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: plus,
    }));
    setMapCenter({ lat, lng });
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert("Please select a valid location before saving.");
      return;
    }

    const token = localStorage.getItem("access_token");
    const payload = {
      name:
        type === "StrayAnimal"
          ? "Stray animal report"
          : formData.name?.trim() || "",
      description: formData.description || null,
      contact_info: formData.contact_info?.trim() || null,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      location_type: typeMap[type],
    };

    const res = await fetch(`${API_URL}/stray-map/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      alert(`Failed to save (${res.status}): ${text}`);
      return;
    }

    onClose();
    onSaved?.(`${typeLabels[type] || "Data"} saved successfully.`);
  };

  const coordsSet = !!(formData.latitude && formData.longitude);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div className="max-h-[88vh] w-full max-w-md overflow-hidden rounded-2xl border border-white/70 bg-white text-slate-900 shadow-2xl shadow-slate-950/25">
        <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Map report
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-950">
              Add {typeLabels[type] || type}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close form"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[calc(88vh-82px)] space-y-4 overflow-y-auto px-6 py-5"
        >
          {type !== "StrayAnimal" && (
            <div className="grid gap-3">
              <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
              <input
                name="contact_info"
                placeholder="Contact info"
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
              />
            </div>
          )}

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
          />

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
              <MapPin size={16} /> Location
            </label>

            {mapsLoaded ? (
              <Autocomplete
                onLoad={(ac) => (autocompleteRef.current = ac)}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  placeholder="Search and pick a place"
                />
              </Autocomplete>
            ) : (
              <input
                name="address"
                value={formData.address}
                onFocus={handleLoadMaps}
                onChange={(e) => {
                  handleLoadMaps();
                  handleChange(e);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none placeholder:text-slate-400"
                placeholder={
                  mapsError
                    ? "Google Maps unavailable"
                    : "Search and pick a place"
                }
              />
            )}

            {(addressError || mapsError) && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {addressError || mapsError}
              </p>
            )}

            {coordsSet && (
              <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-800">
                Selected: {formData.latitude}, {formData.longitude}
              </div>
            )}

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                <LocateFixed size={16} /> Use Current
              </button>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                <Navigation size={16} /> Pick on Map
              </button>
            </div>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!coordsSet}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <Save size={16} /> Save
            </button>
          </div>
        </form>
      </div>

      {showMap && (
        <MapPicker
          onSelect={handleMapSelect}
          onClose={() => setShowMap(false)}
          initialCenter={mapCenter}
        />
      )}
    </div>
  );
}
