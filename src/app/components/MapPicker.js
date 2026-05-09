// components/MapPicker.jsx
"use client";
import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../lib/googleMaps";

const DEFAULT_CENTER = { lat: 7.8731, lng: 80.7718 }; // Sri Lanka
const DEFAULT_ZOOM = 7;

export default function MapPicker({ onSelect, onClose, initialCenter }) {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    let mounted = true;

    loadGoogleMaps(apiKey)
      .then((maps) => {
        if (!mounted) return;
        const center = initialCenter || DEFAULT_CENTER;

        const map = new maps.Map(mapContainerRef.current, {
          center,
          zoom: DEFAULT_ZOOM,
        });

        mapRef.current = map;

        // If user clicks on map, place a marker
        map.addListener("click", (e) => {
          const pos = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (!markerRef.current) {
            markerRef.current = new maps.Marker({
              position: pos,
              map,
            });
          } else {
            markerRef.current.setPosition(pos);
          }
        });

        setLoading(false);
      })
      .catch((err) => {
        setApiError(String(err));
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [initialCenter]);

  function handleSelect() {
    if (!markerRef.current) {
      alert("Please click on the map to choose a location first.");
      return;
    }
    const pos = markerRef.current.getPosition();
    onSelect({ lat: pos.lat(), lng: pos.lng() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl overflow-hidden">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Pick location on map</h3>
          <p className="text-sm text-gray-600">
            Click anywhere on the map to place a marker.
          </p>
        </div>

        <div style={{ height: 420 }} ref={mapContainerRef} className="w-full" />

        <div className="flex justify-end gap-3 p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Select location
          </button>
        </div>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white p-3 rounded shadow">Loading map…</div>
          </div>
        )}

        {apiError && (
          <div className="p-3 text-red-600 text-sm">
            Error loading Google Maps: {apiError}
          </div>
        )}
      </div>
    </div>
  );
}
