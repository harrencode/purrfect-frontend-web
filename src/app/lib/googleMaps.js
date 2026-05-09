"use client";

const GOOGLE_MAPS_SCRIPT_ID = "google-maps-script";
const DEFAULT_LIBRARIES = ["places"];

let loadingPromise = null;

export function loadGoogleMaps(apiKey, libraries = DEFAULT_LIBRARIES) {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is undefined"));
  }

  if (!apiKey) {
    return Promise.reject(
      new Error(
        "Google Maps API key not set in NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
      ),
    );
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(GOOGLE_MAPS_SCRIPT_ID);

    if (existing) {
      existing.addEventListener("load", () => resolve(window.google.maps), {
        once: true,
      });
      existing.addEventListener(
        "error",
        () => reject(new Error("Failed to load Google Maps script")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    const params = new URLSearchParams({
      key: apiKey,
      libraries: libraries.join(","),
    });

    script.id = GOOGLE_MAPS_SCRIPT_ID;
    script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = () => {
      loadingPromise = null;
      reject(new Error("Failed to load Google Maps script"));
    };

    document.head.appendChild(script);
  });

  return loadingPromise;
}
