"use client";

import { useState, useEffect } from "react";
import { PawPrint } from "lucide-react";
import FullPageLoader from "../components/FullPageLoader"; 
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function Adopts() {
  const [showModal, setShowModal] = useState(false);
  const [adoptionReqs, setAdoptionReqs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loadingRecs, setLoadingRecs] = useState(false); 
  const [myAdoptionReqs, setMyAdoptionReqs] = useState([]);

  const [pageLoading, setPageLoading] = useState(true);

  const [formData, setFormData] = useState({
    description: "",
    pet: {
      name: "",
      species: "Dog",
      size: "small",
      temperament: "calm",
      activity_level: "low",
      age: 0,
      gender: "Unknown",
      color: "",
      description: "",
      images: [],
    },
  });

  const [userPrefs, setUserPrefs] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_species: "any",
    preferred_size: "any",
    temperament: "any",
    activity_level: "any",
    min_age: 0,
    max_age: 0,
  });

  const [recommendedPets, setRecommendedPets] = useState([]);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

 
  // Fetch Functions


  const fetchRecommendedPets = async (top_k = 4) => {
    if (!token) return;
    try {
      setLoadingRecs(true); // show loading
      const res = await fetch(`${API_BASE}/recommend/?top_k=${top_k}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch recommended pets");
      const data = await res.json();
      setRecommendedPets(data.recommendations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false); // hide loading
    }
  };

  const fetchAdoptionReqs = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/adoption_reqs/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch adoption requests");
      const data = await res.json();
      setAdoptionReqs(data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchMyAdoptionReqs = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/adoption_reqs/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch my adoption requests");
      const data = await res.json();
      setMyAdoptionReqs(data || []);
    } catch (err) {
      console.error(err);
    }
  };


  const fetchUserPreferences = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch preferences");
      const data = await res.json();
      setPreferences({
        preferred_species: data.preferred_species || "any",
        preferred_size: data.preferred_size || "any",
        temperament: data.temperament || "any",
        activity_level: data.activity_level || "any",
        min_age: data.min_age || 0,
        max_age: data.max_age || 0,
      });
      setUserPrefs(true);
    } catch (err) {
      console.error("Error loading preferences:", err);
      alert("Could not load your preferences. Please log in again.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // run all three in parallel
        await Promise.all([
          fetchRecommendedPets(),
          fetchAdoptionReqs(),
          fetchMyAdoptionReqs(),
        ]);
      } catch (err) {
        // errors are already logged in each fetch, so we can ignore here
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);


  
  // Handlers
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("pet.")) {
      const key = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        pet: { ...prev.pet, [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePrefChange = (e) => {
    const { name, value } = e.target;
    setPreferences((prev) => ({ ...prev, [name]: value }));
  };

  // UPDATED to refresh AI recommendations after saving
  const handlePrefSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/users/preferences`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      if (!res.ok) throw new Error("Failed to update preferences");

      alert("Preferences updated successfully!");
      setUserPrefs(false);

      //  Clear and reload recommended pets
      setRecommendedPets([]);
      await fetchRecommendedPets();
    } catch (err) {
      console.error(err);
      alert("Error updating preferences");
    }
  };

  const handleFileChange = (e) => setSelectedFile(e.target.files[0] || null);

  async function uploadPetImage(petId, file) {
    const data = new FormData();
    data.append("file", file);
    const res = await fetch(`${API_BASE}/pets/${petId}/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: data,
    });
    if (!res.ok) throw new Error("Image upload failed");
    return await res.json();
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!selectedFile)
        formData.pet.images = ["https://placehold.co/300x300?text=No+Image"];

      const res = await fetch(`${API_BASE}/adoption_reqs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Failed to create adoption request");

      const createdReq = await res.json();

      if (selectedFile) {
        setUploading(true);
        try {
          const uploadRes = await uploadPetImage(createdReq.pet.pet_id, selectedFile);
          createdReq.pet.images = [uploadRes.url];
        } catch (err) {
          console.error(err);
        } finally {
          setUploading(false);
        }
      }

      await fetchAdoptionReqs();
      setShowModal(false);
      setFormData({
        description: "",
        pet: {
          name: "",
          species: "Dog",
          size: "small",
          temperament: "calm",
          activity_level: "low",
          age: 0,
          gender: "Unknown",
          color: "",
          description: "",
          images: [],
        },
      });
      setSelectedFile(null);
    } catch (err) {
      console.error(err);
    }
  };

  const startChat = async (adoptionReqId) => {
    if (!token) return alert("Login first");

    try {
      const res = await fetch(`${API_BASE}/chats/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          chat_type: "adoption",
          related_entity_id: adoptionReqId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create chat");
      const chatData = await res.json();
      const chatId = chatData.chatId;

      const updateRes = await fetch(`${API_BASE}/adoption_reqs/${adoptionReqId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ chat_id: chatId }),
      });

      if (!updateRes.ok)
        throw new Error("Failed to update adoption request with chatId");

      window.open(`/adoptions/${chatId}?adoptionReqId=${adoptionReqId}`, "_blank");
    } catch (err) {
      console.error(err);
      alert("Could not start chat: " + err.message);
    }
  };

  const safe = (obj, path, fallback) =>
    path.reduce((a, k) => (a && a[k] != null ? a[k] : fallback), obj);

  
  // UI Rendering
  
  return (
    <div className="relative">
      {pageLoading && <FullPageLoader />}
      {/* Hero Section */}
      <section className="relative w-full min-h-[400px] overflow-hidden flex items-center">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-image.png')" }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/20" />

        {/* Content */}
        <div className="relative z-10 w-full px-4 py-10 sm:py-14 md:py-16 flex justify-center">
          <div className="w-full max-w-5xl bg-white/10 backdrop-blur-lg border border-white/70 rounded-3xl shadow-xl p-6 sm:p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
              <div className="flex-shrink-0">
                <PawPrint className="w-16 h-16 sm:w-20 sm:h-20 text-slate-900" />
              </div>

              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full inline-block">
                  Adoption hub
                </p>

                <h2 className="mt-3 text-xl md:text-2xl font-semibold text-emerald-400">
                  Love, Care, Adopt – One paw at a time
                </h2>

                <p className="text-slate-300 text-sm mt-2 max-w-xl">
                  Connect with animals in need. Make a difference.
                  <br />
                  AI powered search to find the best match
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-5">
                  <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    List for Adoption
                  </button>

                  <button
                    onClick={fetchUserPreferences}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition"
                  >
                    My Preferences
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-[10px] sm:text-xs text-slate-500 text-center md:text-right">
              Updated with new listings and matches.
            </p>
          </div>
        </div>
      </section>


      {/* Recommended Pets */}
      {/* Shared Card Component Rendering */}
      <section>
        <h1 className="bg-orange-100 text-black text-center text-2xl font-semibold py-5">
          AI Recommended Pets for You
        </h1>
        {loadingRecs && (
          <p className="text-center text-gray-600 mb-4">Refreshing recommendations...</p>
        )}
        <div className="flex flex-wrap justify-center gap-6 p-6 bg-orange-100">
          {recommendedPets.map((pet) => {
            const req = adoptionReqs.find(
              (r) => safe(r, ["pet", "pet_id"], null) === pet.pet_id
            );
            if (!req) return null;

            const statusColor =
              req.status === "Completed"
                ? "bg-green-100 text-green-700 border border-green-400"
                : req.status === "Pending"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                : "bg-blue-100 text-blue-700 border border-blue-400";

            return (
              <div
                key={req.id}
                className="group relative flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-2xl border border-gray-200 rounded-2xl w-80 transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300 overflow-hidden"
              >
                {/* Pet Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={
                      safe(req, ["pet", "images", 0]) ||
                      "https://placehold.co/300x300?text=No+Image"
                    }
                    alt={safe(req, ["pet", "name"], "Unknown")}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Species Label */}
                  <div className="absolute top-3 left-3 bg-orange-500/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                    {req?.pet?.species || "Pet"}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md cursor-default ${statusColor}`}
                    >
                      {req.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h6 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      {req.pet.name || "Unknown"}
                      <span className="text-sm text-gray-400">
                        ({req.pet.species || "Pet"})
                      </span>
                    </h6>
                    <p className="text-sm text-gray-600">
                      {req.pet.gender || "Unknown"} • {req.pet.age || 0} years old
                    </p>

                    {/* Pet Description */}
                    {req.pet.description && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {req.pet.description}
                      </p>
                    )}

                    {/* Adoption Request Description */}
                    {req.description && (
                      <p className="mt-2 text-sm text-gray-500 italic line-clamp-2">
                        “{req.description}”
                      </p>
                    )}
                  </div>

                  {/* Adopt Button */}
                  <button
                    onClick={() => startChat(req.id)}
                    disabled={req.status === "Completed"}
                    className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition ${
                      req.status === "Completed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {req.status === "Completed" ? "Adopted" : "Ask to Adopt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* My Adoption Requests */}
      <section>
        <h1 className="bg-blue-100 text-black text-center text-2xl font-semibold py-5">
          My Adoption Requests
        </h1>
        <div className="flex flex-wrap justify-center gap-6 p-6 bg-blue-100">
          {myAdoptionReqs.length === 0 ? (
            <p className="text-gray-700">You haven’t created any adoption requests yet.</p>
          ) : (
            myAdoptionReqs.map((req) => {
              const statusColor =
                req.status === "Completed"
                  ? "bg-green-100 text-green-700 border border-green-400"
                  : req.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                  : "bg-blue-100 text-blue-700 border border-blue-400";

              return (
                <div
                  key={req.id}
                  className="group relative flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-2xl border border-gray-200 rounded-2xl w-80 transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300 overflow-hidden"
                >
                  {/* Pet Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={
                        req.pet.images && req.pet.images.length > 0
                          ? req.pet.images[0]
                          : "https://placehold.co/300x300?text=No+Image"
                      }
                      alt={req.pet.name || "Unknown"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Species Label */}
                    <div className="absolute top-3 left-3 bg-blue-600/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                      {req.pet.species || "Pet"}
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md cursor-default ${statusColor}`}
                      >
                        {req.status || "Unknown"}
                      </span>
                    </div>
                  </div>

                  {/* Pet Info */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h6 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-1">
                        {req.pet.name || "Unknown"}
                        <span className="text-sm text-gray-400">
                          ({req.pet.species || "Pet"})
                        </span>
                      </h6>
                      <p className="text-sm text-gray-600">
                        {req.pet.gender || "Unknown"} • {req.pet.age || 0} years old
                      </p>

                      {req.pet.description && (
                        <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                          {req.pet.description}
                        </p>
                      )}

                      {req.description && (
                        <p className="mt-2 text-sm text-gray-500 italic line-clamp-2">
                          “{req.description}”
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => startChat(req.id)}
                      disabled={req.status === "Completed"}
                      className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition ${
                        req.status === "Completed"
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {req.status === "Completed" ? "Adopted" : "Open Chat"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>






      {/* Meet Your Purr-fect Match */}
      <section>
        <h1 className="bg-green-100 text-black text-center text-2xl font-semibold py-5">
          Meet your Purr-fect Match
        </h1>
        <div className="flex flex-wrap justify-center gap-6 p-6 bg-green-100">
          {adoptionReqs.map((req) => {
            const statusColor =
              req.status === "Completed"
                ? "bg-green-100 text-green-700 border border-green-400"
                : req.status === "Pending"
                ? "bg-yellow-100 text-yellow-700 border border-yellow-400"
                : "bg-blue-100 text-blue-700 border border-blue-400";

            return (
              <div
                key={req.id}
                className="group relative flex flex-col bg-gradient-to-br from-white to-gray-50 shadow-md hover:shadow-2xl border border-gray-200 rounded-2xl w-80 transition transform hover:-translate-y-1 hover:scale-[1.02] duration-300 overflow-hidden"
              >
                {/* Pet Image */}
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={
                      req.pet.images && req.pet.images.length > 0
                        ? req.pet.images[0]
                        : "https://placehold.co/300x300?text=No+Image"
                    }
                    alt={req.pet.name || "Unknown"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Species Label */}
                  <div className="absolute top-3 left-3 bg-green-600/90 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
                    {req.pet.species || "Pet"}
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full shadow-md cursor-default ${statusColor}`}
                    >
                      {req.status || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="p-5 flex flex-col justify-between flex-1">
                  <div>
                    <h6 className="text-lg font-semibold text-gray-800 mb-1 flex items-center gap-1">
                      {req.pet.name || "Unknown"}
                      <span className="text-sm text-gray-400">
                        ({req.pet.species || "Pet"})
                      </span>
                    </h6>
                    <p className="text-sm text-gray-600">
                      {req.pet.gender || "Unknown"} • {req.pet.age || 0} years old
                    </p>

                    {/* Pet Description */}
                    {req.pet.description && (
                      <p className="mt-2 text-sm text-gray-700 line-clamp-2">
                        {req.pet.description}
                      </p>
                    )}

                    {/* Adoption Request Description */}
                    {req.description && (
                      <p className="mt-2 text-sm text-gray-500 italic line-clamp-2">
                        “{req.description}”
                      </p>
                    )}
                  </div>

                  {/* Ask to Adopt Button */}
                  <button
                    onClick={() => startChat(req.id)}
                    disabled={req.status === "Completed"}
                    className={`mt-4 px-4 py-2 rounded-full text-sm font-medium transition ${
                      req.status === "Completed"
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {req.status === "Completed" ? "Adopted" : "Ask to Adopt"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* List for Adoption Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-8 relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
              List Your Pet for Adoption
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Overall Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  rows="3"
                  placeholder="Describe the situation or reason for listing your pet..."
                />
              </div>

              {/* Pet Information */}
              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Pet Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  {/* Pet Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pet Name
                    </label>
                    <input
                      name="pet.name"
                      value={formData.pet.name}
                      onChange={handleChange}
                      placeholder="Enter pet name"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                      required
                    />
                  </div>

                  {/* Species */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Species
                    </label>
                    <select
                      name="pet.species"
                      value={formData.pet.species}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option>Dog</option>
                      <option>Cat</option>
                      {/* <option>Bird</option>
                      <option>Rabbit</option>
                      <option>Other</option> */}
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      name="pet.color"
                      value={formData.pet.color}
                      onChange={handleChange}
                      placeholder="Enter pet color"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Age (years)
                    </label>
                    <input
                      name="pet.age"
                      type="number"
                      value={formData.pet.age}
                      onChange={handleChange}
                      placeholder="e.g. 3"
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      name="pet.gender"
                      value={formData.pet.gender}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option>Unknown</option>
                      <option>Male</option>
                      <option>Female</option>
                    </select>
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      name="pet.size"
                      value={formData.pet.size}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>

                  {/* Temperament */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperament
                    </label>
                    <select
                      name="pet.temperament"
                      value={formData.pet.temperament}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="calm">Calm</option>
                      <option value="playful">Playful</option>
                      <option value="friendly">Friendly</option>
                      <option value="energetic">Energetic</option>
                      <option value="gentle">Gentle</option>
                    </select>
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Activity Level
                    </label>
                    <select
                      name="pet.activity_level"
                      value={formData.pet.activity_level}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-full focus:ring-2 focus:ring-green-500 outline-none"
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                {/* Pet Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pet Description
                  </label>
                  <textarea
                    name="pet.description"
                    value={formData.pet.description}
                    onChange={handleChange}
                    placeholder="Write a brief description about your pet’s personality and needs..."
                    className="border border-gray-300 rounded-lg p-3 w-full text-sm focus:ring-2 focus:ring-green-500 outline-none"
                    rows="3"
                  />
                </div>

                {/* Upload Image */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Pet Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border border-gray-300 rounded-lg p-2 cursor-pointer bg-gray-50 focus:ring-2 focus:ring-green-500 outline-none"
                  />
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2">Uploading image...</p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-5 py-2 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium shadow-md transition"
                >
                  Submit Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}






      {/* Preferences Modal */}
      {userPrefs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-black">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-semibold mb-4">Update My Preferences</h2>
            <form onSubmit={handlePrefSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Species */}
                <div>
                  <label className="block text-sm font-medium">Species</label>
                  <select
                    name="preferred_species"
                    value={preferences.preferred_species}
                    onChange={handlePrefChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                {/* Size */}
                <div>
                  <label className="block text-sm font-medium">Size</label>
                  <select
                    name="preferred_size"
                    value={preferences.preferred_size}
                    onChange={handlePrefChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                {/* Temperament */}
                <div>
                  <label className="block text-sm font-medium">Temperament</label>
                  <select
                    name="temperament"
                    value={preferences.temperament}
                    onChange={handlePrefChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="calm">Calm</option>
                    <option value="playful">Playful</option>
                    <option value="friendly">Friendly</option>
                    <option value="energetic">Energetic</option>
                    <option value="gentle">Gentle</option>
                    <option value="any">Any</option>
                  </select>
                </div>
                {/* Activity Level */}
                <div>
                  <label className="block text-sm font-medium">Activity Level</label>
                  <select
                    name="activity_level"
                    value={preferences.activity_level}
                    onChange={handlePrefChange}
                    className="border rounded-lg p-2 w-full"
                  >
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                    <option value="any">Any</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <input
                  type="number"
                  name="min_age"
                  value={preferences.min_age}
                  onChange={handlePrefChange}
                  placeholder="Min Age"
                  className="border rounded-lg p-2 w-full"
                />
                <input
                  type="number"
                  name="max_age"
                  value={preferences.max_age}
                  onChange={handlePrefChange}
                  placeholder="Max Age"
                  className="border rounded-lg p-2 w-full"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setUserPrefs(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
