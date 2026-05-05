"use client";

import { useState, useRef } from "react";
import {
  GoogleMap,
  Marker,
  Autocomplete,
  useJsApiLoader,
} from "@react-google-maps/api";

export default function RescueReportForm({ onClose, onSubmit }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL;
  const [location, setLocation] = useState(""); // Plus Code
  const [coords, setCoords] = useState({ lat: null, lon: null });
  const [description, setDescription] = useState("");
  const [alertType, setAlertType] = useState("Medium");
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);

  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  const placeholderImage = "https://via.placeholder.com/400x300?text=No+Image";
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script only once
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["places"],
  });

  //Get Plus Code from coordinates using Google Plus Codes API
  const getPlusCode = async (lat, lon) => {
    try {
      const res = await fetch(
        `https://plus.codes/api?address=${lat},${lon}&email=noreply@demo.com`
      );
      const data = await res.json();
      return (
        data?.plus_code?.global_code ||
        `${lat.toFixed(5)}, ${lon.toFixed(5)}`
      );
    } catch {
      return `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    }
  };

  // When a user selects a place from autocomplete
  const handlePlaceChanged = async () => {
    const place = autocompleteRef.current.getPlace();
    if (!place.geometry) return;

    const lat = place.geometry.location.lat();
    const lon = place.geometry.location.lng();

    const plusCode = await getPlusCode(lat, lon);
    setCoords({ lat, lon });
    setLocation(plusCode);

    if (mapRef.current) mapRef.current.panTo({ lat, lng: lon });
  };

  // Use browser geolocation
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
        if (mapRef.current) mapRef.current.panTo({ lat, lng: lon });
      },
      (err) => alert("Failed to get location: " + err.message),
      { enableHighAccuracy: true }
    );
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
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 text-black">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold mb-4">Report a Rescue</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Location (Plus Code) */}
          <label className="text-sm font-medium text-gray-700">
            Location (Plus Code)
          </label>
          {isLoaded && (
            <Autocomplete
              onLoad={(ac) => (autocompleteRef.current = ac)}
              onPlaceChanged={handlePlaceChanged}
            >
              <input
                type="text"
                placeholder="Search or click 'Use Current Location'"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="border p-2 rounded w-full"
                required
              />
            </Autocomplete>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
            >
              Use Current Location
            </button>
            <button
              type="button"
              onClick={() => setMapVisible((prev) => !prev)}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm"
            >
              {mapVisible ? "Hide Map" : "Select on Map"}
            </button>
          </div>

          {/* Google Map */}
          {isLoaded && mapVisible && (
            <div className="mt-2 h-60 rounded overflow-hidden">
              <GoogleMap
                onLoad={(map) => (mapRef.current = map)}
                center={
                  coords.lat
                    ? { lat: coords.lat, lng: coords.lon }
                    : { lat: 7.8731, lng: 80.7718 }
                }
                zoom={coords.lat ? 13 : 7}
                mapContainerStyle={{ width: "100%", height: "100%" }}
                onClick={async (e) => {
                  const lat = e.latLng.lat();
                  const lon = e.latLng.lng();
                  const plusCode = await getPlusCode(lat, lon);
                  setCoords({ lat, lon });
                  setLocation(plusCode);
                }}
              >
                {coords.lat && (
                  <Marker position={{ lat: coords.lat, lng: coords.lon }} />
                )}
              </GoogleMap>
            </div>
          )}

          {/* Description */}
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            placeholder="Describe the situation (e.g., injured animal, trapped pet, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded min-h-[80px]"
            required
          />

          {/* Alert Type */}
          <label className="text-sm font-medium text-gray-700">Alert Level</label>
          <select
            value={alertType}
            onChange={(e) => setAlertType(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Upload Image */}
          <label className="text-sm font-medium text-gray-700">Photo (optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            className="border p-2 rounded"
          />

          {/* Submit + Cancel */}
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-full"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
