import React, { useState, useEffect, useTransition } from "react";
import {
  Ticket,
  ShieldAlert,
  Sparkles,
  Key,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  User,
  HelpCircle,
  ShieldCheck,
  Phone,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Persona } from "../types";
import { useFetch } from "../hooks/useFetch";

interface LoginPageProps {
  onLoginSuccess: (persona: Persona) => void;
  allPersonas: Persona[];
  onRegisterSuccess: (newPersona: Persona) => void;
}

export default function LoginPage({
  onLoginSuccess,
  allPersonas,
  onRegisterSuccess,
}: LoginPageProps) {
  // Tabs: 'LOGIN_MOBILE' | 'REGISTER' | 'FORGOT_PASSWORD'
  const [activeFormTab, setActiveFormTab] = useState<
    "LOGIN_MOBILE" | "REGISTER" | "FORGOT_PASSWORD"
  >("LOGIN_MOBILE");

  const [mobileInput, setMobileInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  const [registerRole, setRegisterRole] = useState<"buyer" | "seller">("buyer");
  const [loginMethod, setLoginMethod] = useState<"OTP" | "GOOGLE">("OTP");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Collapse state for testing sandbox - initially false (collapsed)
  const [showSandbox, setShowSandbox] = useState(false);

  const { request } = useFetch();

  // Simulated OTP state
  const [sentOtp, setSentOtp] = useState<string | null>(null);
  const [otpSentLoading, setOtpSentLoading] = useState(false);

  // Start the real Google Sign-In popup using Google OAuth Authorization flow
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

  // Listen for secure authentication events returned from the real callback popup
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Validate that the message origin matches ours to ensure secure message processing
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
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [onLoginSuccess]);

  // Request Mobile OTP login helper
  const handleRequestOtp = () => {
    if (!mobileInput || mobileInput.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number first.");
      return;
    }
    setOtpSentLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const data = await request<{ simulationOtp: string }>(
          "/api/auth/request-otp",
          {
            method: "POST",
            body: { mobileNumber: mobileInput },
          },
        );
        setSentOtp(data.simulationOtp);
        setSuccessMsg(
          `Simulated OTP text sent: ${data.simulationOtp} (Use this code to login!).`,
        );
        setOtpInput(data.simulationOtp); // Auto prefill for convenient sandbox verification!
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMsg(err.message || "Network or gateway connection timeout.");
        }
      } finally {
        setOtpSentLoading(false);
      }
    });
  };

  // Login handler
  const handleMobileLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput) {
      setErrorMsg("Enter your registered Indian mobile number.");
      return;
    }
    if (!otpInput && !passwordInput) {
      setErrorMsg(
        "Enter either the OTP code or your passcode to authenticate.",
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const data = await request<{ user: Persona }>(
          "/api/auth/login-mobile",
          {
            method: "POST",
            body: {
              mobileNumber: mobileInput,
              otp: otpInput || undefined,
              password: passwordInput || undefined,
            },
          },
        );
        setSuccessMsg(
          `Authenticated successfully! Welcome as ${data.user.name}.`,
        );
        setTimeout(() => {
          onLoginSuccess({
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            avatar: data.user.avatar,
            email: data.user.email || `${mobileInput}@ticketswap.in`,
          });
        }, 600);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMsg(
            err.message || "Verification failed. Check your security entries.",
          );
        }
      }
    });
  };

  // Email Login handler
  const handleEmailLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    if (!loginPassword) {
      setErrorMsg("Please enter your passcode.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const data = await request<{ user: Persona }>("/api/auth/login-email", {
          method: "POST",
          body: {
            email: loginEmail,
            password: loginPassword,
          },
        });
        setSuccessMsg(
          `Authenticated successfully! Welcome, ${data.user.name}.`,
        );
        setTimeout(() => {
          onLoginSuccess({
            id: data.user.id,
            name: data.user.name,
            role: data.user.role,
            avatar: data.user.avatar,
            email: data.user.email || `${loginEmail}`,
          });
        }, 600);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMsg(
            err.message ||
              "Authentication failed. Check your email and passcode.",
          );
        }
      }
    });
  };

  // Register Form Submit (Validated inside backend using Zod)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !mobileInput || !passwordInput) {
      setErrorMsg(
        "Please complete the required fields: Name, Phone, and Passcode.",
      );
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const data = await request<{
          user: Persona;
          alreadyRegistered?: boolean;
        }>("/api/auth/register", {
          method: "POST",
          body: {
            name: nameInput.trim(),
            mobileNumber: mobileInput,
            password: passwordInput,
            email: emailInput.trim() || undefined,
            role: registerRole,
          },
        });

        if (data.alreadyRegistered) {
          setSuccessMsg(
            `Google Account is already registered! Logging you in seamlessly as ${data.user.name}...`,
          );
        } else {
          setSuccessMsg(
            `Profile created successfully! Verification complete. Logging in...`,
          );
        }

        const newPersona = {
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
          avatar: data.user.avatar,
          email: data.user.email || `${mobileInput}@ticketswap.in`,
        };

        if (!data.alreadyRegistered) {
          onRegisterSuccess(newPersona);
        }
        setTimeout(() => {
          onLoginSuccess(newPersona);
        }, 1200);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMsg(
            err.message || "Check your formatting or use another phone number.",
          );
        }
      }
    });
  };

  // Forgot Password Submit
  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileInput || !passwordInput) {
      setErrorMsg("Please fill both mobile number and new passcode.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");

    startTransition(async () => {
      try {
        const data = await request<{ message: string }>(
          "/api/auth/forgot-password",
          {
            method: "POST",
            body: {
              mobileNumber: mobileInput,
              newPassword: passwordInput,
            },
          },
        );
        setSuccessMsg(data.message || "Passcode updated successfully!");
        setTimeout(() => {
          setActiveFormTab("LOGIN_MOBILE");
          setOtpInput("");
        }, 1500);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          setErrorMsg(
            err.message ||
              "Reset failed. Verify that your mobile is registered.",
          );
        }
      }
    });
  };

  // Standard preset switcher
  const handleQuickSelect = (persona: Persona) => {
    setErrorMsg("");
    setSuccessMsg("");
    startTransition(async () => {
      await new Promise((resolve) => setTimeout(resolve, 450));
      onLoginSuccess(persona);
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center px-4 py-4 relative overflow-hidden font-sans">
      {/* Blurred decorative backdrops to keep compact style centered */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-pink-600/10 via-rose-600/5 to-indigo-600/10 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"
        aria-hidden="true"
      />

      <main className="max-w-md w-full glass-card border border-gray-850 p-6 rounded-2xl relative overflow-hidden shadow-2xl space-y-4">
        {/* Compact logo visual header */}
        <div className="text-center space-y-1">
          <div
            className="inline-flex p-2 bg-gradient-to-tr from-pink-600 to-indigo-600 rounded-xl text-white shadow shadow-pink-900/30"
            aria-hidden="true"
          >
            <Ticket className="w-5 h-5 rotate-12" />
          </div>
          <h1 className="text-xl font-extrabold font-display tracking-tight text-white block">
            Ticket<span className="text-pink-500">Swap</span>
          </h1>
          <p className="text-gray-400 text-[11px] max-w-xs mx-auto">
            Consolidated Mobile OTP Escrow Gateway for Movie Seats
          </p>
        </div>
        {/* Tab switcher - compact sizing with 3 tab targets */}
        <div
          className="bg-gray-900 p-1 rounded-lg border border-gray-800 flex gap-1"
          role="tablist"
          aria-label="Authentication Flow Controls"
        >
          <button
            id="tab-login"
            role="tab"
            aria-selected={activeFormTab === "LOGIN_MOBILE"}
            aria-controls="panel-login"
            type="button"
            onClick={() => {
              setActiveFormTab("LOGIN_MOBILE");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded transition-all cursor-pointer ${
              activeFormTab === "LOGIN_MOBILE"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Login
          </button>

          <button
            id="tab-register"
            role="tab"
            aria-selected={activeFormTab === "REGISTER"}
            aria-controls="panel-register"
            type="button"
            onClick={() => {
              setActiveFormTab("REGISTER");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded transition-all cursor-pointer ${
              activeFormTab === "REGISTER"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Register
          </button>

          <button
            id="tab-forgot"
            role="tab"
            aria-selected={activeFormTab === "FORGOT_PASSWORD"}
            aria-controls="panel-forgot"
            type="button"
            onClick={() => {
              setActiveFormTab("FORGOT_PASSWORD");
              setErrorMsg("");
              setSuccessMsg("");
            }}
            className={`flex-1 py-1.5 text-[11px] font-semibold rounded transition-all cursor-pointer ${
              activeFormTab === "FORGOT_PASSWORD"
                ? "bg-pink-600 text-white shadow"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Forgot Password
          </button>
        </div>
        {/* Alert Messages is rendered ultra thin and is aria-live alert-safe for blind users */}
        <div aria-live="assertive" className="empty:hidden space-y-2">
          {errorMsg && (
            <div
              className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] rounded-lg flex items-center gap-2"
              role="alert"
            >
              <ShieldAlert
                className="w-3.5 h-3.5 text-rose-500 shrink-0"
                aria-hidden="true"
              />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              className="p-2.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[11px] rounded-lg flex items-center gap-2"
              role="status"
            >
              <CheckCircle
                className="w-3.5 h-3.5 text-emerald-500 shrink-0"
                aria-hidden="true"
              />
              <span className="leading-snug font-mono whitespace-pre-line">
                {successMsg}
              </span>
            </div>
          )}
        </div>{" "}
        {/* Form components with tightened fields and reduced margins/paddings */}
        {activeFormTab === "LOGIN_MOBILE" && (
          <div className="space-y-4">
            <form
              id="panel-login-otp"
              onSubmit={handleMobileLoginSubmit}
              className="space-y-3"
            >
              <div>
                <label
                  htmlFor="login-mobile"
                  className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                >
                  Indian Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-550 text-xs"
                      aria-hidden="true"
                    >
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                    </span>
                    <input
                      id="login-mobile"
                      type="tel"
                      required
                      aria-required="true"
                      aria-label="Indian Mobile Number"
                      placeholder="e.g. 9876543210"
                      maxLength={10}
                      className="w-full pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    disabled={otpSentLoading || isPending}
                    aria-label="Send mobile login OTP code text"
                    className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    {otpSentLoading ? (
                      <RefreshCw
                        className="w-3 h-3 animate-spin"
                        aria-hidden="true"
                      />
                    ) : (
                      "Send OTP"
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="login-otp"
                    className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                  >
                    Enter 6-Digit OTP
                  </label>
                  <input
                    id="login-otp"
                    type="text"
                    aria-label="6-Digit OTP Verification Code"
                    placeholder="e.g. 123456"
                    maxLength={6}
                    className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    htmlFor="login-passcode"
                    className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                  >
                    Security Passcode
                  </label>
                  <div className="relative">
                    <input
                      id="login-passcode"
                      type={showPassword ? "text" : "password"}
                      aria-label="Passcode (Optional)"
                      placeholder="Optional details"
                      className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-2 bg-pink-600 hover:bg-pink-550 disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isPending ? (
                  <Loader2
                    className="w-3.5 h-3.5 animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <>
                    Verify OTP & Continue
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </>
                )}
              </button>

              <div className="relative my-3.5 flex items-center justify-center">
                <div
                  className="absolute inset-0 flex items-center"
                  aria-hidden="true"
                >
                  <div className="w-full border-t border-gray-800"></div>
                </div>
                <div className="relative text-center">
                  <span className="bg-gray-950 px-2 text-[8px] uppercase tracking-wider text-gray-450 font-mono font-bold">
                    Or connect via security sso
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => startRealGoogleOauth("LOGIN")}
                disabled={isPending}
                className="w-full py-2 bg-white hover:bg-gray-150 text-gray-900 font-bold rounded-lg text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow border border-gray-200 opacity-90 hover:opacity-100"
              >
                <svg
                  className="w-4 h-4 shrink-0"
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
                Continue with Google
              </button>
            </form>

            <div className="text-center pt-1.5 border-t border-gray-900/50">
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("FORGOT_PASSWORD");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[10px] text-zinc-500 hover:text-pink-400 font-mono transition-colors cursor-pointer"
              >
                Forgot your security passcode? Reset passcode here
              </button>
            </div>
          </div>
        )}
        {activeFormTab === "REGISTER" && (
          <form
            id="panel-register"
            role="tabpanel"
            aria-labelledby="tab-register"
            onSubmit={handleRegisterSubmit}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                >
                  Your Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  aria-required="true"
                  placeholder="e.g. Dev Gupta"
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="reg-mobile"
                  className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                >
                  Mobile Number
                </label>
                <input
                  id="reg-mobile"
                  type="tel"
                  required
                  aria-required="true"
                  placeholder="10 digit number"
                  maxLength={10}
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                  value={mobileInput}
                  onChange={(e) => setMobileInput(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label
                  htmlFor="reg-pass"
                  className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                >
                  Password (6+ chars)
                </label>
                <input
                  id="reg-pass"
                  type="password"
                  required
                  aria-required="true"
                  placeholder="••••••••"
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                >
                  Email (Optional)
                </label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="dev@example.com"
                  className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <span className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold">
                Platform Intent
              </span>
              <div
                className="flex gap-2"
                role="group"
                aria-label="Platform User Role Intent selection"
              >
                <button
                  type="button"
                  aria-pressed={registerRole === "buyer"}
                  onClick={() => setRegisterRole("buyer")}
                  className={`flex-1 py-1 px-2 border text-xs font-semibold rounded-lg text-center transition cursor-pointer ${
                    registerRole === "buyer"
                      ? "bg-pink-600/20 border-pink-550 text-pink-400"
                      : "bg-gray-950 border-gray-850 text-gray-400"
                  }`}
                >
                  I want to Buy
                </button>
                <button
                  type="button"
                  aria-pressed={registerRole === "seller"}
                  onClick={() => setRegisterRole("seller")}
                  className={`flex-1 py-1 px-2 border text-xs font-semibold rounded-lg text-center transition cursor-pointer ${
                    registerRole === "seller"
                      ? "bg-pink-600/20 border-pink-550 text-pink-400"
                      : "bg-gray-950 border-gray-850 text-gray-400"
                  }`}
                >
                  I want to Sell
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-pink-600 hover:bg-pink-550 disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {isPending ? "Signing up..." : "Register Account"}
            </button>

            <div className="relative my-3 flex items-center justify-center">
              <div
                className="absolute inset-0 flex items-center"
                aria-hidden="true"
              >
                <div className="w-full border-t border-gray-850"></div>
              </div>
              <div className="relative text-center">
                <span className="bg-gray-950 px-2 text-[8px] uppercase tracking-wider text-gray-450 font-mono font-bold">
                  Or register via security sso
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => startRealGoogleOauth("REGISTER")}
              disabled={isPending}
              className="w-full py-2 bg-white hover:bg-gray-150 text-gray-900 font-bold rounded-lg text-xs tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow border border-gray-200"
            >
              <svg
                className="w-4 h-4 shrink-0"
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
              Continue with Google
            </button>

            <div className="text-center pt-1.5 border-t border-gray-900/50">
              <button
                type="button"
                onClick={() => {
                  setActiveFormTab("FORGOT_PASSWORD");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="text-[10px] text-zinc-500 hover:text-pink-400 font-mono transition-colors cursor-pointer"
              >
                Already have an account? Forgot passcode? Reset here
              </button>
            </div>
          </form>
        )}
        {activeFormTab === "FORGOT_PASSWORD" && (
          <form
            id="panel-forgot"
            role="tabpanel"
            aria-labelledby="tab-forgot"
            onSubmit={handleForgotPasswordSubmit}
            className="space-y-3"
          >
            <p className="text-[10px] text-gray-450">
              Submit your mobile number registered on the Escrow Swap. We&#39;ll
              update your passcode securely.
            </p>

            <div>
              <label
                htmlFor="forgot-mobile"
                className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
              >
                Registered Mobile Number
              </label>
              <input
                id="forgot-mobile"
                type="tel"
                required
                aria-required="true"
                placeholder="Enter 10-digit registered number"
                maxLength={10}
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                value={mobileInput}
                onChange={(e) => setMobileInput(e.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="forgot-pass"
                className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
              >
                Choose New Passcode
              </label>
              <input
                id="forgot-pass"
                type="password"
                required
                aria-required="true"
                placeholder="Minimum 6 characters"
                className="w-full px-3 py-1.5 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-2 bg-pink-600 hover:bg-pink-550 disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              {isPending ? "Resetting passcode..." : "Update Passcode Safely"}
            </button>
          </form>
        )}
        {/* Collapsible Demo Testing Sandbox Accordion */}
        <div className="border border-gray-850 rounded-xl bg-gray-900/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSandbox(!showSandbox)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-850/40 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] font-semibold text-gray-250 uppercase font-mono tracking-wide">
                Demo Mobile Testing Sandbox
              </span>
            </div>
            {showSandbox ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {showSandbox && (
            <div className="p-3 pt-0 border-t border-gray-850 space-y-3 bg-gray-950/20">
              <p className="text-[9px] text-zinc-400 leading-normal mt-2">
                No real SMS cost! Simply write your number, click{" "}
                <b>&quot;Send OTP&quot;</b> and verification is completed in
                seconds with the returned code.
              </p>

              {/* Compact Quick Switch Section inside Accordion */}
              <div className="pt-2 border-t border-gray-850/50 space-y-1.5">
                <h3 className="text-zinc-550 text-[8px] font-mono uppercase tracking-wider font-bold">
                  ⚡ Quick-Login Sandbox Swap Accounts
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {allPersonas.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleQuickSelect(p)}
                      type="button"
                      aria-label={`Test login as ${p.name}, specialized in ${p.role} functions`}
                      className="p-1.5 bg-gray-900 hover:bg-gray-850 border border-gray-800 rounded-lg text-left transition flex items-center gap-1.5 cursor-pointer group"
                    >
                      <img
                        src={p.avatar}
                        className="w-5.5 h-5.5 rounded-full object-cover shrink-0"
                        alt=""
                      />
                      <div className="truncate text-[9px]">
                        <p className="font-bold text-white group-hover:text-pink-400 capitalize truncate">
                          {p.name.split(" ")[0]}
                        </p>
                        <p className="text-[8px] text-zinc-550 font-mono capitalize leading-none">
                          {p.role}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
