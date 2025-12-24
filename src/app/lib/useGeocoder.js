// lib/useGeocoder.js
export async function geocodeAddress(address) {
  if (!address || !address.trim()) {
    throw new Error("Address is empty");
  }

  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Google Maps API key not configured");

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
    address
  )}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Geocoding request failed (${res.status})`);
  }
  const data = await res.json();

  if (data.status !== "OK" || !data.results || data.results.length === 0) {
    // Provide the raw status for debugging purposes
    throw new Error(`Geocode failed: ${data.status}`);
  }

  const loc = data.results[0].geometry.location;
  return { lat: loc.lat, lng: loc.lng, raw: data.results[0] };
}
