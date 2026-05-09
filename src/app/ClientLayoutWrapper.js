"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { clearAuthSession, refreshAuthSession } from "./lib/authSession";

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

function withAuthorizationHeader(args, accessToken) {
  const [input, init = {}] = args;

  if (input instanceof Request) {
    const headers = new Headers(input.headers);
    headers.set("Authorization", `Bearer ${accessToken}`);
    return [new Request(input, { headers })];
  }

  const headers = new Headers(init.headers || {});
  headers.set("Authorization", `Bearer ${accessToken}`);
  return [input, { ...init, headers }];
}

export default function ClientLayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sessionExpired, setSessionExpired] = useState(false);

  const hideLayout =
    pathname?.startsWith("/signup") ||
    pathname?.startsWith("/signin") ||
    pathname?.startsWith("/verify-account");



  // Reset session popup on auth pages
  useEffect(() => {
    if (
      pathname?.startsWith("/signin") ||
      pathname?.startsWith("/signup") ||
      pathname?.startsWith("/verify-account")
    ) {
      setSessionExpired(false);
    }

  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    // Patch fetch globally: refresh once on 401 while user is using the app.
    window.fetch = async (...args) => {
      const res = await originalFetch(...args);

      // Ignore auth endpoints entirely (token, verify, verify-code, resend-code, refresh)
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      const isAuthCall = url.includes("/auth/");

      if (isAuthCall) return res;

      if (res.status !== 401) return res;

      const newAccessToken = await refreshAuthSession(originalFetch);
      if (newAccessToken) {
        return originalFetch(...withAuthorizationHeader(args, newAccessToken));
      }

      if (
        !pathname?.startsWith("/signin") &&
        !pathname?.startsWith("/signup") &&
        !pathname?.startsWith("/verify-account")
      ) {
        setSessionExpired(true);
      }
      return res;
    };


    // On first load (for non-auth pages), verify token explicitly
    const checkSession = async () => {
      if (
        pathname?.startsWith("/signin") ||
        pathname?.startsWith("/signup") ||
        pathname?.startsWith("/verify-account")
      ) {
        return;
      }


      const token = localStorage.getItem("access_token");

      if (!token) {
        // no token -> user just not logged in, don't show "expired" modal
        return;
      }

      try {
        const res = await originalFetch(`${API_BASE}/auth/verify`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const refreshedToken = await refreshAuthSession(originalFetch);
          if (refreshedToken) return;

          setSessionExpired(true);
        }
      } catch (err) {
        console.error("Error while verifying session:", err);
        setSessionExpired(true);
      }
    };

    checkSession();

    return () => {
      window.fetch = originalFetch;
    };
  }, [pathname]);

  const handleLoginClick = () => {
    clearAuthSession();
    router.push("/signin");
  };

  return (
    <>
      <div className={sessionExpired && !hideLayout ? "app-blurred" : ""}>
        {!hideLayout && <Navbar />}
        {children}
        {!hideLayout && <Footer />}
      </div>

      {!hideLayout && sessionExpired && (
        <div className="session-backdrop">
          <div className="improved-modal">
            <h2 className="modal-title">Session Expired</h2>
            <p className="modal-message">
              Your session has expired due to inactivity.
              <br />
              Please log in again to continue.
            </p>
            <button className="modal-button" onClick={handleLoginClick}>
              Log In Again
            </button>
          </div>
        </div>
      )}
    </>
  );
}
