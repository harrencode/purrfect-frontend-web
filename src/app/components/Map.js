// components/Map.js
// "use client"
// import { useEffect } from 'react'

// export default function Map() {
//   useEffect(() => {
//     window.initMap = function () {
//       const map = new google.maps.Map(document.getElementById("map"), {
//         center: { lat: 6.9271, lng: 79.8612 },
//         zoom: 12,
//       });

//       new google.maps.Marker({ position: { lat: 6.9271, lng: 79.8612 }, map });
//     };
//   }, []);

//   return <div id="map" className="w-full h-full rounded-lg shadow-md" />
// }


// components/Map.js
"use client";

import { useEffect, useRef } from "react";

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export default function Map() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // store the Google Map instance

  useEffect(() => {
    // Don't run on server
    if (typeof window === "undefined") return;

    function initMap() {
      if (!mapRef.current || mapInstance.current) return; // prevent duplicates

      mapInstance.current = new google.maps.Map(mapRef.current, {
        center: { lat: 6.9271, lng: 79.8612 },
        zoom: 12,
      });

      new google.maps.Marker({
        position: { lat: 6.9271, lng: 79.8612 },
        map: mapInstance.current,
      });
    }

    // Load the Google Maps script only once
    if (!window.google) {
      if (!document.getElementById("google-maps-script")) {
        const script = document.createElement("script");
        script.id = "google-maps-script";
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
        script.async = true;
        script.defer = true;
        script.onload = initMap;
        document.head.appendChild(script);
      } else {
        // If script is already loading, wait until it's ready
        document
          .getElementById("google-maps-script")
          .addEventListener("load", initMap);
      }
    } else {
      initMap();
    }

    // Cleanup: avoid memory leaks on hot reload
    return () => {
      if (mapInstance.current) {
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="w-full h-full rounded-lg shadow-md">
      <div
        ref={mapRef}
        id="map"
        className="w-full h-full rounded-lg"
        style={{ minHeight: "400px" }}
      />
    </div>
  );
}
