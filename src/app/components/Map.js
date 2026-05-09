"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "../lib/googleMaps";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/stray-map/`;

export default function Map() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const [strays, setStrays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foundCount, setFoundCount] = useState(0);

  // Fetch all stray markers
  const fetchNearbyStrays = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("access_token")
          : null;

      const res = await fetch(`${API_URL}?location_type=stray_animal`, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok)
        throw new Error(`Failed to fetch stray data (${res.status})`);
      const data = await res.json();

      const onlyStrays = data.filter(
        (item) => item.location_type === "stray_animal",
      );

      setStrays(onlyStrays);
      setFoundCount(onlyStrays.length);
    } catch (err) {
      console.error("Error fetching strays:", err);
    } finally {
      setLoading(false);
    }
  };

  const initMap = (lat, lng) => {
    if (!mapRef.current) return;

    // Reuse map if it already exists
    if (mapInstance.current instanceof google.maps.Map) {
      mapInstance.current.setCenter({ lat, lng });
      return;
    }

    const map = new google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 9,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        {
          featureType: "road",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    mapInstance.current = map;

    // User marker
    new google.maps.Marker({
      position: { lat, lng },
      map,
      title: "You are here",
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: "#2563EB",
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#fff",
      },
    });
  };

  const renderStrayMarkers = (list) => {
    if (
      !mapInstance.current ||
      !(mapInstance.current instanceof google.maps.Map)
    ) {
      console.warn("Map instance not ready, skipping stray markers.");
      return;
    }

    // Clear old markers
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    list.forEach((stray) => {
      const lat = parseFloat(stray.latitude);
      const lng = parseFloat(stray.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstance.current,
        title: stray.name || "Stray Animal",
        icon: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="font-size:14px;max-width:220px;">
            <strong style="color:#dc2626;">${stray.name}</strong><br/>
            <p>${stray.description || "No description"}</p>
            <small>📍 ${stray.contact_info || "No contact"}</small>
          </div>
        `,
      });

      marker.addListener("click", () =>
        infoWindow.open(mapInstance.current, marker),
      );
      markersRef.current.push(marker);
    });
  };

  // Mount logic
  // useEffect(() => {
  //   if (typeof window === "undefined") return;

  //   let cancelled = false;

  //   const setup = async (lat, lng) => {
  //     try {
  //       await loadGoogleMaps();
  //       if (cancelled) return;

  //       initMap(lat, lng);
  //       await fetchNearbyStrays();
  //     } catch (err) {
  //       console.error("Error loading Google Maps:", err);
  //       setLoading(false);
  //     }
  //   };

  //   navigator.geolocation.getCurrentPosition(
  //     (pos) => {
  //       const { latitude: lat, longitude: lng } = pos.coords;
  //       setup(lat, lng);
  //     },
  //     (err) => {
  //       console.error("Geolocation failed:", err);
  //       const defaultLat = 7.8731;
  //       const defaultLng = 80.7718;
  //       setup(defaultLat, defaultLng);
  //     }
  //   );

  //   return () => {
  //     cancelled = true;
  //   };
  // }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    let cancelled = false;

    const setup = async (lat, lng) => {
      try {
        await loadGoogleMaps(apiKey);
        if (cancelled) return;

        initMap(lat, lng);
        await fetchNearbyStrays();
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setLoading(false);
      }
    };

    const defaultLat = 7.8731;
    const defaultLng = 80.7718;

    // Skip geolocation on insecure origins
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      console.warn(
        "Geolocation not available (needs HTTPS or localhost). Using default map center.",
      );
      setup(defaultLat, defaultLng);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude: lat, longitude: lng } = pos.coords;
          setup(lat, lng);
        },
        (err) => {
          console.warn("Geolocation failed:", err?.message ?? err);
          setup(defaultLat, defaultLng);
        },
      );
    }

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (strays.length) {
      renderStrayMarkers(strays);
    }
  }, [strays]);

  return (
    <div className="relative w-full h-full rounded-lg shadow-md">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70 z-10">
          <div className="animate-spin border-4 border-blue-500 border-t-transparent rounded-full w-8 h-8" />
          <p className="ml-3 text-gray-700 font-medium">Loading map...</p>
        </div>
      )}
      {foundCount > 0 && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-1 rounded-full text-sm shadow-md z-10">
          🐾 {foundCount} stray animals near you
        </div>
      )}
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full rounded-lg"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
