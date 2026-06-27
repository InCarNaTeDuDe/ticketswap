import React, { useEffect } from "react";

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

interface GoogleOneTapProps {
  clientId: string;
  gsiLoaded: boolean;
  onLoginSuccess: (user: any) => void;
  setErrorMsg: (msg: string) => void;
  setSuccessMsg: (msg: string) => void;
}

export default function GoogleOneTap({
  clientId,
  gsiLoaded,
  onLoginSuccess,
  setErrorMsg,
  setSuccessMsg,
}: GoogleOneTapProps) {
  useEffect(() => {
    if (!gsiLoaded || !clientId) return;

    const initOneTap = () => {
      try {
        if (!(window as any).google?.accounts?.id) return;

        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const decoded = decodeJwt(response.credential);
              if (decoded && decoded.email) {
                setErrorMsg("");
                setSuccessMsg(
                  `Google One Tap verified! Logging in as ${decoded.name || decoded.email}...`,
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
                      setErrorMsg(
                        loginData.error || "Google One Tap login failed.",
                      );
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
          auto_select: true,
          itp_support: true,
        });

        // Prompt Google One Tap instantly
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed()) {
            console.log(
              "One Tap not displayed reason:",
              notification.getNotDisplayedReason(),
            );
          }
        });
      } catch (e) {
        console.error("One Tap initialization error:", e);
      }
    };

    if ((window as any).google?.accounts?.id) {
      initOneTap();
    } else {
      const interval = setInterval(() => {
        if ((window as any).google?.accounts?.id) {
          clearInterval(interval);
          initOneTap();
        }
      }, 150);
      return () => clearInterval(interval);
    }
  }, [gsiLoaded, clientId, onLoginSuccess, setErrorMsg, setSuccessMsg]);

  // This is a background/headless element, it doesn't render visual content of its own
  return null;
}
