"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Loader2 } from "lucide-react";

export default function FullMap({ selectedType, onLoaded }) {
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mapInitializedRef = useRef(false);
  const markersLoadedRef = useRef(false);

  const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/stray-map/`;

  
   //INITIALIZE GOOGLE MAP (1 time only)
   
  useEffect(() => {
    window.initMap = () => {
      const mapInstance = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 7.8731, lng: 80.7718 },
        zoom: 8,
      });

      setMap(mapInstance);
      mapInitializedRef.current = true;

      // If markers already loaded, fire onLoaded
      if (markersLoadedRef.current && typeof onLoaded === "function") {
        onLoaded();
      }
    };
  }, [onLoaded]);

  
   //LOAD MARKERS ON TYPE CHANGE
   
  useEffect(() => {
    if (!map) return;

    const loadMarkers = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("access_token");
      try {
        const url = selectedType
          ? `${API_URL}?location_type=${selectedType}`
          : API_URL;

        const res = await fetch(url, {
          headers: {
            Accept: "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) throw new Error(`Failed to load markers (${res.status})`);

        const data = await res.json();
        if (!Array.isArray(data)) throw new Error("Invalid API response");

        // Clear old markers
        markers.forEach((m) => m.setMap(null));

        // Add new ones
        const newMarkers = data
          .map((item) => {
            const lat = parseFloat(item.latitude);
            const lng = parseFloat(item.longitude);
            if (isNaN(lat) || isNaN(lng)) return null;

            let iconUrl;
            switch (item.location_type) {
              case "rescue_home":
              case "RescueHome":
                iconUrl = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
                break;
              case "vet_center":
              case "VetCenter":
                iconUrl = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
                break;
              case "stray_animal":
              case "StrayAnimal":
                iconUrl = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
                break;
              default:
                iconUrl =
                  "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
            }

            const marker = new google.maps.Marker({
              position: { lat, lng },
              map,
              title: item.name || "Unknown",
              icon: iconUrl,
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="font-size:14px">
                <strong>${item.name || "No name"}</strong><br/>
                <small>${item.description || "No description"}</small><br/>
                <em>Type: ${item.location_type}</em>
              </div>`,
            });

            marker.addListener("click", () => infoWindow.open(map, marker));
            return marker;
          })
          .filter(Boolean);

        setMarkers(newMarkers);
        markersLoadedRef.current = true;

        // FIRE onLoaded when markers finish loading
        if (mapInitializedRef.current && typeof onLoaded === "function") {
          onLoaded();
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMarkers();
  }, [selectedType, map, onLoaded]);

  return (
    <div className="relative w-full h-[600px] text-black">
      {/* Google Maps Script */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        strategy="afterInteractive"
      />

      {/* Map Container */}
      <div id="map" className="w-full h-full rounded-lg shadow-md" />

      {/* Marker Loader */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
          <Loader2 className="w-6 h-6 text-gray-700 animate-spin" />
          <span className="ml-2 text-gray-700">Loading markers...</span>
        </div>
      )}

      {/* Error Toast */}
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-md">
          {error}
        </div>
      )}
    </div>
  );
}
