"use client";

import { useEffect, useRef, useState } from "react";
import {
  User as UserIcon,
  PawPrint,
  SlidersHorizontal,
  Save,
  Loader2,
  Lock,
} from "lucide-react";
import Image from "next/image";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL; 
const PROFILE_UPLOAD_URL =
  process.env.NEXT_PUBLIC_PROFILE_UPLOAD_URL ||
  `${API_BASE_URL}/users/upload-s3?folder=profiles`;

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingPreferences, setLoadingPreferences] = useState(false);
  const [prefSuccess, setPrefSuccess] = useState("");
  const [prefError, setPrefError] = useState("");

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    new_password_confirm: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoSuccess, setPhotoSuccess] = useState("");
  const [photoError, setPhotoError] = useState("");
  const [profileImageError, setProfileImageError] = useState(false);
  const photoInputRef = useRef(null);

  // Preferences form state 
  const [preferences, setPreferences] = useState({
    preferred_species: "any",
    preferred_size: "any",
    temperament: "any",
    activity_level: "any",
    min_age: "",
    max_age: "",
  });

  // Get token from your auth (adjust this to your setup)
  const getAuthHeaders = (includeJson = true) => {
    const token = localStorage.getItem("access_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    return includeJson ? { ...headers, "Content-Type": "application/json" } : headers;
  };

  // Load current user on mount
  useEffect(() => {
    async function fetchUser() {
      setLoadingUser(true);
      try {
        const res = await fetch(`${API_BASE_URL}/users/me`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          throw new Error("Failed to load user profile");
        }

        const data = await res.json();
        setUser(data);
        setPhotoPreview(data?.profile_photo_url || "");
        setProfileImageError(false);

        // Map backend enum values (likely lower-case strings) into local state
        setPreferences({
          preferred_species: data.preferred_species || "any",
          preferred_size: data.preferred_size || "any",
          temperament: data.temperament || "any",
          activity_level: data.activity_level || "any",
          min_age: data.min_age ?? "",
          max_age: data.max_age ?? "",
        });
      } catch (err) {
        console.error(err);
        setPrefError("Unable to load your profile right now.");
      } finally {
        setLoadingUser(false);
      }
    }

    fetchUser();
  }, []);

  const handlePreferenceChange = (field, value) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPrefError("");
    setPrefSuccess("");
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setLoadingPreferences(true);
    setPrefError("");
    setPrefSuccess("");

    // Build payload – send values or null if empty for ages
    const payload = {
      preferred_species: preferences.preferred_species || null,
      preferred_size: preferences.preferred_size || null,
      temperament: preferences.temperament || null,
      activity_level: preferences.activity_level || null,
      min_age:
        preferences.min_age === "" ? null : Number(preferences.min_age),
      max_age:
        preferences.max_age === "" ? null : Number(preferences.max_age),
    };

    try {
      const res = await fetch(`${API_BASE_URL}/users/preferences`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update preferences");
      }

      const updatedUser = await res.json();
      setUser(updatedUser);
      setPrefSuccess("Preferences updated successfully.");
    } catch (err) {
      console.error(err);
      setPrefError(err.message || "Something went wrong while saving.");
    } finally {
      setLoadingPreferences(false);
    }
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setPasswordError("");
    setPasswordSuccess("");
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setProfileImageError(false);
    setPhotoError("");
    setPhotoSuccess("");

    await uploadProfilePhoto(file, previewUrl);
  };

  useEffect(() => {
    if (photoPreview) {
      setProfileImageError(false);
    }
    return () => {
      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const uploadProfilePhoto = async (file, previewUrl) => {
    if (!file) {
      setPhotoError("Please choose a photo first.");
      return;
    }

    setPhotoUploading(true);
    setPhotoError("");
    setPhotoSuccess("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch(PROFILE_UPLOAD_URL, {
        method: "POST",
        headers: getAuthHeaders(false),
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorText = await uploadRes.text().catch(() => "");
        throw new Error(errorText || "Failed to upload profile image");
      }

      const uploadData = await uploadRes.json().catch(() => ({}));
      const uploadedUrl =
        uploadData.url ||
        uploadData.file_url ||
        uploadData.location ||
        uploadData.profile_photo_url ||
        "";

      if (!uploadedUrl) {
        throw new Error("Upload succeeded but no image URL was returned.");
      }

      const updateRes = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ profile_photo_url: uploadedUrl }),
      });

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update profile photo");
      }

      const updatedUser = await updateRes.json();
      setUser(updatedUser);
      setPhotoPreview(updatedUser?.profile_photo_url || uploadedUrl);
      setProfileImageError(false);
      setPhotoSuccess("Profile photo updated.");
    } catch (err) {
      console.error(err);
      setPhotoError(err.message || "Could not update profile photo.");
      setPhotoPreview(user?.profile_photo_url || "");
    } finally {
      setPhotoUploading(false);
      if (photoInputRef.current) {
        photoInputRef.current.value = "";
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const res = await fetch(`${API_BASE_URL}/users/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(passwordForm),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to change password");
      }

      setPasswordSuccess("Password changed successfully.");
      setPasswordForm({
        current_password: "",
        new_password: "",
        new_password_confirm: "",
      });
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Something went wrong while updating.");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <section className="relative w-full py-16 md:py-24 bg-gradient-to-br from-orange-50 via-white to-green-50 overflow-hidden">
      {/* Gradient blobs */}
      <div className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-gradient-to-br from-orange-400 via-pink-500 to-red-500 opacity-80 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-green-400 via-teal-400 to-blue-500 opacity-80 blur-[120px]" />

      <div className="relative mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/70 backdrop-blur-md shadow-md">
              <UserIcon className="h-5 w-5 text-slate-800" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Your Profile
              </p>
              <h1 className="text-xl md:text-2xl font-semibold text-slate-900">
                Account & Preferences
              </h1>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Profile + Preferences */}
          <div className="space-y-6">
            {/* Profile card */}
            <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-md p-5 md:p-6 flex items-start gap-4">
              {loadingUser ? (
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 rounded-full bg-slate-200 animate-pulse" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-slate-200 animate-pulse" />
                    <div className="h-3 w-48 rounded bg-slate-100 animate-pulse" />
                  </div>
                </div>
              ) : (
                <>
                  <Image
                    src={
                      profileImageError
                        ? "/images/default-avatar.png"
                        : photoPreview ||
                          user?.profile_photo_url ||
                          "/images/default-avatar.png"
                    }
                    alt="Profile"
                    width={64}
                    height={64}
                    unoptimized={photoPreview?.startsWith("blob:")}
                    onError={() => setProfileImageError(true)}
                    className="h-16 w-16 rounded-full object-cover border border-white shadow-sm"
                  />
                  <div className="flex flex-col gap-1 flex-1">
                    <p className="text-sm font-semibold text-slate-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-[11px] font-medium text-orange-700">
                      <PawPrint className="h-3 w-3" />
                      <span>Rescue-ready profile</span>
                    </div>
                    <div className="mt-3">
                      <input
                        ref={photoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        disabled={photoUploading}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50"
                      >
                        {photoUploading && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        )}
                        <span>{photoUploading ? "Uploading..." : "Change photo"}</span>
                      </button>
                    </div>
                    {(photoSuccess || photoError) && (
                      <p
                        className={`text-xs ${
                          photoError ? "text-red-600" : "text-emerald-600"
                        }`}
                      >
                        {photoError || photoSuccess}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Preferences form */}
            <form
              onSubmit={handleSavePreferences}
              className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-md p-5 md:p-6 space-y-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <SlidersHorizontal className="h-4 w-4 text-green-600" />
                  <span>Match Preferences</span>
                </div>
                {loadingPreferences && (
                  <div className="inline-flex items-center gap-1 text-xs text-slate-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Saving…</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-600">
                These preferences help us highlight pets that are more likely to
                be a good fit for you. You can change them at any time.
              </p>

              <div className="grid gap-3 md:grid-cols-2">
                {/* Preferred species */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Preferred species
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.preferred_species}
                    onChange={(e) =>
                      handlePreferenceChange("preferred_species", e.target.value)
                    }
                  >
                    <option value="any">Any</option>
                    <option value="dog">Dogs</option>
                    <option value="cat">Cats</option>
                  </select>
                </div>

                {/* Preferred size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Preferred size
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.preferred_size}
                    onChange={(e) =>
                      handlePreferenceChange("preferred_size", e.target.value)
                    }
                  >
                    <option value="any">Any</option>
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                {/* Temperament */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Temperament
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.temperament}
                    onChange={(e) =>
                      handlePreferenceChange("temperament", e.target.value)
                    }
                  >
                    <option value="any">Any</option>
                    <option value="calm">Calm</option>
                    <option value="playful">Playful</option>
                    <option value="friendly">Friendly</option>
                    <option value="energetic">Energetic</option>
                    <option value="gentle">Gentle</option>
                  </select>
                </div>

                {/* Activity level */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Activity level
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.activity_level}
                    onChange={(e) =>
                      handlePreferenceChange("activity_level", e.target.value)
                    }
                  >
                    <option value="any">Any</option>
                    <option value="low">Low</option>
                    <option value="moderate">Moderate</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Min age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Minimum age (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.min_age}
                    onChange={(e) =>
                      handlePreferenceChange("min_age", e.target.value)
                    }
                    placeholder="No minimum"
                  />
                </div>

                {/* Max age */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Maximum age (years)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={preferences.max_age}
                    onChange={(e) =>
                      handlePreferenceChange("max_age", e.target.value)
                    }
                    placeholder="No maximum"
                  />
                </div>
              </div>

              {prefError && (
                <p className="text-xs text-red-500">{prefError}</p>
              )}
              {prefSuccess && (
                <p className="text-xs text-green-600">{prefSuccess}</p>
              )}

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={loadingPreferences}
                  className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-green-700 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
                >
                  {loadingPreferences ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save preferences</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right: Password change */}
          <div className="space-y-4">
            <form
              onSubmit={handleChangePassword}
              className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/80 shadow-md p-5 md:p-6 space-y-4"
            >
              <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Lock className="h-4 w-4 text-slate-700" />
                <span>Security</span>
              </div>

              <p className="text-xs text-slate-600">
                Update your password regularly to keep your account secure.
              </p>

              <div className="space-y-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Current password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={passwordForm.current_password}
                    onChange={(e) =>
                      handlePasswordInputChange(
                        "current_password",
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    New password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={passwordForm.new_password}
                    onChange={(e) =>
                      handlePasswordInputChange("new_password", e.target.value)
                    }
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-700">
                    Confirm new password
                  </label>
                  <input
                    type="password"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs md:text-sm text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                    value={passwordForm.new_password_confirm}
                    onChange={(e) =>
                      handlePasswordInputChange(
                        "new_password_confirm",
                        e.target.value
                      )
                    }
                  />
                </div>
              </div>

              {passwordError && (
                <p className="text-xs text-red-500">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-xs text-green-600">{passwordSuccess}</p>
              )}

              <button
                type="submit"
                disabled={changingPassword}
                className="mt-1 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs md:text-sm font-medium text-white shadow-md transition hover:bg-slate-800 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2"
              >
                {changingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>Change password</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
