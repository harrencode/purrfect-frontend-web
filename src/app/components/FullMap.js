'use client'
import { useEffect, useState } from 'react'
import Script from 'next/script'

const rescueHomes = [
  { lat: 6.866, lng: 80.041, label: 'Rescue Home A' },
  { lat: 6.870, lng: 80.045, label: 'Rescue Home B' },
]

const strayAnimals = [
  { lat: 6.872, lng: 80.050, label: 'Stray Cat' },
  { lat: 6.875, lng: 80.048, label: 'Stray Dog' },
]

const vetCenters = [
  { lat: 6.880, lng: 80.052, label: 'Vet Clinic A' },
  { lat: 6.885, lng: 80.055, label: 'Vet Clinic B' },
]

export default function InteractiveMap() {
  const [selectedType, setSelectedType] = useState('rescue')
  const [map, setMap] = useState(null)

  useEffect(() => {
    window.initMap = () => {
      const mapInstance = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 7.8731, lng: 80.7718 }, // Central Sri Lanka
        zoom: 8,
      })

      mapInstance.setOptions({
        restriction: {
          latLngBounds: {
            north: 10.0,
            south: 5.5,
            west: 79.5,
            east: 82.0,
          },
          strictBounds: false,
        },
      })

      setMap(mapInstance)
    }
  }, [])

  useEffect(() => {
    if (!map) return

    map.setZoom(8)
    map.setCenter({ lat: 7.8731, lng: 80.7718 })

    const markerData =
      selectedType === 'rescue'
        ? rescueHomes
        : selectedType === 'stray'
        ? strayAnimals
        : vetCenters

    // Clear existing markers (optional enhancement)
    map.markers?.forEach(marker => marker.setMap(null))
    map.markers = []

    markerData.forEach(({ lat, lng, label }) => {
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: label,
      })
      map.markers.push(marker)
    })
  }, [selectedType, map])

  return (
    <div className="relative w-full h-[600px]">
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&callback=initMap`}
        strategy="afterInteractive"
      />
      <div className="absolute top-4 left-4 z-10 flex gap-2 text-black">
        <button
          onClick={() => setSelectedType('rescue')}
          className={`px-4 py-2 rounded ${
            selectedType === 'rescue' ? 'bg-gray-500 text-white' : 'bg-white'
          }`}
        >
          Rescue Homes
        </button>
        <button
          onClick={() => setSelectedType('stray')}
          className={`px-4 py-2 rounded ${
            selectedType === 'stray' ? 'bg-gray-500 text-white' : 'bg-white'
          }`}
        >
          Stray Map
        </button>
        <button
          onClick={() => setSelectedType('vet')}
          className={`px-4 py-2 rounded ${
            selectedType === 'vet' ? 'bg-gray-500 text-white' : 'bg-white'
          }`}
        >
          Veterinary Centers
        </button>
      </div>
      <div id="map" className="w-full h-full rounded-lg shadow-md" />
    </div>
  )
}
