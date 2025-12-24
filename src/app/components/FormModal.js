"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { geocodeAddress } from "../lib/useGeocoder";

const MapPicker = dynamic(() => import("./MapPicker"), { ssr: false });

export default function FormModal({ type, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contact_info: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [showMap, setShowMap] = useState(false);
  const [finding, setFinding] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [mapCenter, setMapCenter] = useState(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const typeMap = {
    StrayAnimal: "stray_animal",
    RescueHome: "rescue_home",
    VetCenter: "vet_center",
  };

  const handleChange = (e) => {
    setAddressError("");
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const getPlusCode = async (lat, lng) => {
    try {
      const res = await fetch(
        `https://plus.codes/api?address=${lat},${lng}&key=${GOOGLE_API_KEY}`
      );
      const data = await res.json();
      return data?.plus_code?.global_code || "";
    } catch {
      return "";
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const plus = await getPlusCode(lat, lng);
        setFormData((prev) => ({
          ...prev,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6),
          address: plus || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        }));
      },
      (err) => alert("Failed: " + err.message)
    );
  };

  const handleFindFromAddress = async () => {
    setAddressError("");
    if (!formData.address.trim()) {
      setAddressError("Please type an address.");
      return;
    }

    setFinding(true);
    try {
      const result = await geocodeAddress(formData.address);
      const plus = await getPlusCode(result.lat, result.lng);
      setFormData((prev) => ({
        ...prev,
        latitude: result.lat.toFixed(6),
        longitude: result.lng.toFixed(6),
        address: plus || prev.address,
      }));
      setMapCenter({ lat: result.lat, lng: result.lng });
    } catch (err) {
      setAddressError(err.message || "Failed to find address");
    } finally {
      setFinding(false);
    }
  };

  const handleMapSelect = async ({ lat, lng }) => {
    const plus = await getPlusCode(lat, lng);
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: plus || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }));
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.latitude || !formData.longitude) {
      alert("Please select a valid location before saving.");
      return;
    }

    try {
      const token = localStorage.getItem("access_token");

      const payload = {
        description: formData.description || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        location_type: typeMap[type],
      };

      // Only include name/contact_info if not a StrayAnimal
      if (type !== "StrayAnimal") {
        payload.name = formData.name;
        payload.contact_info = formData.contact_info || null;
      }

      const res = await fetch(`${API_URL}/stray-map/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Failed to save (${res.status})`);
      alert("Data saved successfully!");
      onClose();
    } catch (err) {
      alert(err.message || "Error saving data");
    }
  };

  const coordsSet = !!(formData.latitude && formData.longitude);

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg text-black">
        <h2 className="text-xl font-bold mb-4 capitalize">
          Add {type.replace("_", " ")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Only show name and contact_info for non-StrayAnimal types */}
          {type !== "StrayAnimal" && (
            <>
              <input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                required
                className="w-full border rounded p-2"
              />
              <input
                name="contact_info"
                placeholder="Contact Info"
                onChange={handleChange}
                className="w-full border rounded p-2"
              />
            </>
          )}

          <textarea
            name="description"
            placeholder="Description"
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <div>
            <label className="text-sm font-medium">
              Location (Plus Code / Address)
            </label>
            <div className="flex gap-2 mt-1">
              <input
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="flex-1 border rounded p-2"
                placeholder="Type or auto-filled Plus Code"
              />
              <button
                type="button"
                onClick={handleFindFromAddress}
                disabled={finding}
                className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                {finding ? "..." : "Find"}
              </button>
            </div>
            {addressError && (
              <p className="text-red-600 text-sm">{addressError}</p>
            )}

            <div className="flex gap-2 mt-3">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Use Current
              </button>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                Pick on Map
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!coordsSet}
              className={`px-4 py-2 text-white rounded ${
                coordsSet ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300"
              }`}
            >
              Save
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
