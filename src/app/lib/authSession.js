"use client";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const SESSION_COOKIE_KEY = "session_active";
const DEFAULT_ACCESS_MAX_AGE_SECONDS = 15 * 60;
const DEFAULT_REFRESH_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;
const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function getJwtMaxAgeSeconds(token, fallbackSeconds) {
  try {
    const encodedPayload = token.split(".")[1];
    const base64Payload = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64Payload));
    if (!payload?.exp) return fallbackSeconds;

    const secondsUntilExpiry = Math.floor(payload.exp - Date.now() / 1000);
    return Math.max(0, secondsUntilExpiry);
  } catch {
    return fallbackSeconds;
  }
}

function cookieSecureAttribute() {
  return window.location.protocol === "https:" ? "; secure" : "";
}

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=strict${cookieSecureAttribute()}`;
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function saveAuthSession(
  accessToken,
  accessExpiresInSeconds,
  refreshToken,
  refreshExpiresInSeconds,
) {
  if (!accessToken) return;

  const accessMaxAge = Math.max(
    0,
    Number(accessExpiresInSeconds) ||
      getJwtMaxAgeSeconds(accessToken, DEFAULT_ACCESS_MAX_AGE_SECONDS),
  );
  const refreshMaxAge = Math.max(
    0,
    Number(refreshExpiresInSeconds) ||
      getJwtMaxAgeSeconds(refreshToken, DEFAULT_REFRESH_MAX_AGE_SECONDS),
  );

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  setCookie(ACCESS_TOKEN_KEY, accessToken, accessMaxAge);

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(SESSION_COOKIE_KEY, "1", refreshMaxAge);
  }
}

export async function refreshAuthSession(fetcher = fetch) {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) return null;

  const response = await fetcher(`${API_BASE}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearAuthSession();
    return null;
  }

  const data = await response.json();
  saveAuthSession(
    data.access_token,
    data.expires_in,
    data.refresh_token,
    data.refresh_expires_in,
  );

  return data.access_token;
}

export function clearAuthSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  setCookie(ACCESS_TOKEN_KEY, "", 0);
  setCookie(SESSION_COOKIE_KEY, "", 0);
}
