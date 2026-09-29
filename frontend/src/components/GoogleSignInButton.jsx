import { useEffect, useRef, useState } from "react";
import { googleLogin } from "../api/authApi";

const GIS_SRC = "https://accounts.google.com/gsi/client";

// Ek hi baar script load karo — Login dono pages reuse kar sakte hain
let gisPromise = null;
const loadGis = () => {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no window"));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google);
  }

  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve(window.google);
      script.onerror = () => {
        gisPromise = null;
        reject(new Error("Failed to load Google Identity Services"));
      };
      document.head.appendChild(script);
    });
  }

  return gisPromise;
};

/**
 * Google "Sign in" button (Google Identity Services official widget).
 *
 * Props:
 *  - mode: "signin" | "signup"  (sirf button ka label badalta hai)
 *  - onSuccess(data): backend se { token, user } milne par chalta hai
 *  - onError(message)
 */
export default function GoogleSignInButton({
  mode = "signin",
  onSuccess,
  onError,
}) {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const buttonRef = useRef(null);
  const callbackRef = useRef({ onSuccess, onError });
  const [status, setStatus] = useState(() =>
    clientId ? "loading" : "disabled",
  ); // loading | ready | disabled | error
  const [verifying, setVerifying] = useState(false);

  // Parent ke latest callbacks hamesha fresh rakho (stale closure avoid)
  useEffect(() => {
    callbackRef.current = { onSuccess, onError };
  }, [onSuccess, onError]);

  useEffect(() => {
    if (!clientId) {
      if (import.meta.env.DEV) {
        console.warn(
          "[GoogleSignInButton] VITE_GOOGLE_CLIENT_ID missing — Google login disabled.",
        );
      }
      return;
    }

    let cancelled = false;

    loadGis()
      .then((google) => {
        if (cancelled || !buttonRef.current) return;

        google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            const { onSuccess: ok, onError: err } = callbackRef.current;

            if (!response?.credential) {
              err?.("Google did not return a credential. Please try again.");
              return;
            }

            setVerifying(true);
            try {
              const data = await googleLogin(response.credential);
              ok?.(data);
            } catch (error) {
              const message =
                error?.response?.data?.message ||
                error?.message ||
                "Google sign-in failed";
              err?.(message);
            } finally {
              setVerifying(false);
            }
          },
          error_callback: () => {
            const { onError: err } = callbackRef.current;
            err?.("Google sign-in was cancelled or blocked.");
          },
        });

        google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          shape: "rectangular",
          text: mode === "signup" ? "signup_with" : "signin_with",
          width: 336,
        });

        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [clientId, mode]);

  if (status === "disabled") {
    // Client ID set nahi hai — UI clutter na ho, sirf dev me hint do
    if (!import.meta.env.DEV) return null;
    return (
      <p className="text-[11px] text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
        Google login disabled — set VITE_GOOGLE_CLIENT_ID in frontend/.env
      </p>
    );
  }

  return (
    <div className="relative flex flex-col items-center">
      {/* Official Google button yahan render hoti hai */}
      <div
        ref={buttonRef}
        className="min-h-[44px] w-full flex justify-center"
        style={{ opacity: verifying ? 0.4 : 1 }}
      />

      {verifying && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600">
          <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          Signing you in…
        </div>
      )}

      {status === "error" && (
        <p className="text-[11px] text-center text-rose-600 mt-1">
          Could not load Google sign-in. Check your connection.
        </p>
      )}
    </div>
  );
}
