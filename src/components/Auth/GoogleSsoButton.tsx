import React, { useEffect, useTransition } from "react";

// Helper to decode Google Client SSO Identity JWT tokens without heavy dependencies
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

interface GoogleSsoButtonProps {
  clientId: string;
  gsiLoaded: boolean;
  onLoginSuccess: (user: any) => void;
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function GoogleSsoButton({
  clientId,
  gsiLoaded,
  onLoginSuccess,
  setErrorMsg,
  setSuccessMsg,
}: GoogleSsoButtonProps) {
  const [isPending, startTransition] = useTransition();

  // 1. Popup Google Authentication logic
  const startRealGoogleOauth = (context: "LOGIN" | "REGISTER") => {
    setErrorMsg("");
    setSuccessMsg("");

    const width = 500;
    const height = 650;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `/api/auth/google/url?context=${context}`,
      "Google Sign-In",
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`,
    );

    if (!popup) {
      setErrorMsg(
        "Popup blocked! Please allow popups for this site to log in with Google.",
      );
    }
  };

  // 2. Listen for messages from the login popup window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data && event.data.type === "GOOGLE_LOGIN_SUCCESS") {
        const { user, isNew } = event.data.data;
        setSuccessMsg(
          isNew
            ? `Google Account registered successfully! Welcome ${user.name}.`
            : `Google SSO Verified! Welcome back, ${user.name}.`,
        );
        setTimeout(() => {
          onLoginSuccess({
            id: user.id,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            email: user.email,
          });
        }, 800);
      } else if (event.data && event.data.type === "GOOGLE_LOGIN_FAILURE") {
        setErrorMsg(event.data.error || "Google Single Sign-on failed.");
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onLoginSuccess, setErrorMsg, setSuccessMsg]);

  // 3. Render native GSI button when ready
  useEffect(() => {
    if (!gsiLoaded || !clientId || !(window as any).google?.accounts?.id)
      return;

    try {
      // First initialize GSI
      (window as any).google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: any) => {
          if (response.credential) {
            const decoded = decodeJwt(response.credential);
            if (decoded && decoded.email) {
              setErrorMsg("");
              setSuccessMsg(
                `Google Identity verified! Logging in as ${decoded.name || decoded.email}...`,
              );

              fetch("/api/auth/login-google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  email: decoded.email,
                  name: decoded.name,
                  avatar: decoded.picture,
                }),
              })
                .then((r) => r.json())
                .then((loginData) => {
                  if (loginData.success) {
                    setTimeout(() => {
                      onLoginSuccess(loginData.user);
                    }, 1000);
                  } else {
                    setErrorMsg(loginData.error || "Google login failed.");
                  }
                })
                .catch(() => {
                  setErrorMsg(
                    "Connection to Google login API endpoint failed.",
                  );
                });
            }
          }
        },
        itp_support: true,
      });

      const btnEl = document.getElementById("google-gsi-button-container");
      if (btnEl) {
        (window as any).google.accounts.id.renderButton(btnEl, {
          theme: "filled_black",
          size: "large",
          text: "continue_with",
          shape: "pill",
          width: btnEl.clientWidth || 320,
        });
      }
    } catch (e) {
      console.error("GSI Button rendering error:", e);
    }
  }, [gsiLoaded, clientId, onLoginSuccess, setErrorMsg, setSuccessMsg]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      {/* Native GSI Button loaded via Google Identity SDK */}
      <div
        id="google-gsi-button-container"
        className="w-full flex justify-center min-h-[44px]"
      ></div>

      {/* Custom Google SSO Button as active fallback and visual helper */}
      <button
        type="button"
        onClick={() => startTransition(() => startRealGoogleOauth("LOGIN"))}
        disabled={isPending}
        className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-bold rounded-xl text-xs tracking-wide transition-all duration-150 flex items-center justify-center gap-2.5 cursor-pointer shadow-lg border border-gray-200 active:scale-[0.98] disabled:opacity-50"
      >
        <svg
          className="w-5 h-5 shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.08H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.92l2.85-2.22.81-.6z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.08l3.66 2.84c.87-2.6 3.3-4.54 6.16-4.54z"
            fill="#EA4335"
          />
        </svg>
        Open Google Pop-up Authenticator
      </button>

      <p className="text-[10px] text-gray-500 text-center leading-normal max-w-xs">
        Note: If Google's fast One Tap or Native button fails to render due to
        iframe sandbox restrictions, use the <b>Pop-up Authenticator</b>{" "}
        fallback above.
      </p>
    </div>
  );
}
