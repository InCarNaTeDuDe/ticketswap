"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Ticket,
  Sparkles,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  Phone,
  CheckCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Persona } from "../types";
import { useFetch } from "../hooks/useFetch";
import GoogleOneTap from "./Auth/GoogleOneTap";
import GoogleSsoButton from "./Auth/GoogleSSOButton";
import ErrorDisplay from "./Auth/ErrorDisplay";

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

  // Google Identity Services (GSI) state managers
  const [gsiLoaded, setGsiLoaded] = useState<boolean>(false);
  const [clientId, setClientId] = useState<string>("");

  // Fetch Google Client ID once on mount
  useEffect(() => {
    let active = true;
    fetch("/api/auth/google/client-id")
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        if (data.clientId) {
          setClientId(data.clientId);
          setGsiLoaded(true);
        }
      })
      .catch((err) => {
        console.error("GSI Client ID retrieval failed:", err);
      });
    return () => {
      active = false;
    };
  }, []);

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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Blurred decorative backdrops to keep compact style centered */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[420px] h-[420px] bg-gradient-to-tr from-pink-600/15 via-rose-600/10 to-indigo-600/15 rounded-full blur-3xl -z-10 animate-pulse duration-[8000ms]"
        aria-hidden="true"
      />

      <main className="max-w-md w-full glass-card border border-gray-850 p-7 rounded-2xl relative overflow-hidden shadow-2xl space-y-6">
        {/* Compact logo visual header */}
        <div className="text-center space-y-2">
          <div
            className="inline-flex p-3 bg-gradient-to-tr from-pink-600 to-indigo-600 rounded-2xl text-white shadow shadow-pink-900/30"
            aria-hidden="true"
          >
            <Ticket className="w-6 h-6 rotate-12" />
          </div>
          <h1 className="text-2xl font-extrabold font-display tracking-tight text-white block">
            Ticket<span className="text-pink-500">Swap</span>
          </h1>
          <p className="text-gray-400 text-xs max-w-xs mx-auto">
            India's Peer-to-Peer Escrow Movie Ticket Resale Hub
          </p>
        </div>

        {/* Alert Messages are rendered ultra thin and are aria-live alert-safe */}
        <div aria-live="assertive" className="empty:hidden space-y-2">
          <ErrorDisplay message={errorMsg} />

          {successMsg && (
            <div
              className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs rounded-xl flex items-center gap-2.5"
              role="status"
            >
              <CheckCircle
                className="w-4 h-4 text-emerald-500 shrink-0"
                aria-hidden="true"
              />
              <span className="leading-snug font-mono whitespace-pre-line">
                {successMsg}
              </span>
            </div>
          )}
        </div>

        {/* PRIMARY EXPERIENCES: ONE-CLICK SIGN-IN OPTIONS */}
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-wide uppercase font-mono text-pink-400">
              One-Click Google Sign-In
            </h2>
            <p className="text-[11px] text-gray-500 mt-1">
              Connect securely with your Google Account instantly.
            </p>
          </div>

          {/* Reusable Official Google GSI Button Container and Custom Fallback */}
          <GoogleSsoButton
            clientId={clientId}
            gsiLoaded={gsiLoaded}
            onLoginSuccess={onLoginSuccess}
            setErrorMsg={setErrorMsg}
            setSuccessMsg={setSuccessMsg}
          />

          {/* Quick Preset Single-Click accounts wrapped in a native HTML details accordion, hidden by default */}
          <details className="group border border-gray-850 rounded-xl bg-gray-900/30 overflow-hidden">
            <summary className="list-none flex items-center justify-between p-3.5 text-left hover:bg-gray-850/30 transition-colors focus:outline-none cursor-pointer select-none">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-[10px] font-bold text-gray-300 uppercase font-mono tracking-wider">
                  Instant Single-Click Demo Users
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="p-4 border-t border-gray-850 space-y-3 bg-gray-950/40 animate-fadeIn">
              <p className="text-[10px] text-zinc-400">
                Select a pre-loaded Indian cinema profile to log in in exactly{" "}
                <b>one click</b>:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {allPersonas.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickSelect(p)}
                    type="button"
                    aria-label={`Instant login as ${p.name}`}
                    className="p-2 bg-gray-900/60 hover:bg-gray-850/80 hover:border-pink-500/40 border border-gray-850 rounded-xl text-left transition flex items-center gap-2 cursor-pointer group"
                  >
                    <img
                      src={p.avatar}
                      className="w-7 h-7 rounded-full object-cover shrink-0 border border-gray-800"
                      alt=""
                    />
                    <div className="truncate text-left">
                      <p className="font-bold text-white text-xs group-hover:text-pink-400 capitalize truncate">
                        {p.name.split(" ")[0]}
                      </p>
                      <p className="text-[9px] text-zinc-500 font-mono capitalize leading-none mt-0.5">
                        {p.role}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </details>
        </div>

        {/* SECONDARY / COLLAPSIBLE: TRADITIONAL MOBILE OTP LOGINS */}
        <div className="border border-gray-850 rounded-xl bg-gray-900/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSandbox(!showSandbox)}
            className="w-full flex items-center justify-between p-3.5 text-left hover:bg-gray-850/30 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-pink-400" />
              <span className="text-[10px] font-bold text-gray-300 uppercase font-mono tracking-wider">
                Advanced Mobile OTP & Custom Form Options
              </span>
            </div>
            {showSandbox ? (
              <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>

          {showSandbox && (
            <div className="p-4 border-t border-gray-850 space-y-4 bg-gray-950/40">
              {/* Form Selector Row inside collapsible accordion */}
              <div className="grid grid-cols-3 gap-1 bg-gray-950 p-1 rounded-lg border border-gray-850 mb-2">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("LOGIN_MOBILE")}
                  className={`py-1 text-[10px] font-bold rounded cursor-pointer transition ${activeFormTab === "LOGIN_MOBILE" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Form Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab("REGISTER")}
                  className={`py-1 text-[10px] font-bold rounded cursor-pointer transition ${activeFormTab === "REGISTER" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Form Register
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab("FORGOT_PASSWORD")}
                  className={`py-1 text-[10px] font-bold rounded cursor-pointer transition ${activeFormTab === "FORGOT_PASSWORD" ? "bg-pink-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  Reset
                </button>
              </div>

              {/* TAB 1: FORM LOGIN MOBILE */}
              {activeFormTab === "LOGIN_MOBILE" && (
                <form onSubmit={handleMobileLoginSubmit} className="space-y-3">
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
                          placeholder="e.g. 9876543210"
                          maxLength={10}
                          className="w-full pl-8 pr-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                          value={mobileInput}
                          onChange={(e) => setMobileInput(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleRequestOtp}
                        disabled={otpSentLoading || isPending}
                        className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        {otpSentLoading ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          "Send OTP"
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="login-otp"
                        className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                      >
                        6-Digit OTP Code
                      </label>
                      <input
                        id="login-otp"
                        type="text"
                        placeholder="e.g. 123456"
                        maxLength={6}
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="login-passcode"
                        className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                      >
                        Passcode (Optional)
                      </label>
                      <input
                        id="login-passcode"
                        type={showPassword ? "text" : "password"}
                        placeholder="Passcode link"
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-550 disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isPending ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Verify OTP & Continue
                        <ArrowRight className="w-3 h-3" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: FORM REGISTER */}
              {activeFormTab === "REGISTER" && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label
                        htmlFor="reg-name"
                        className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold"
                      >
                        Full Name
                      </label>
                      <input
                        id="reg-name"
                        type="text"
                        required
                        placeholder="e.g. Dev Gupta"
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
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
                        placeholder="10 digit phone"
                        maxLength={10}
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
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
                        placeholder="••••••••"
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
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
                        className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <span className="block text-gray-450 font-mono text-[9px] uppercase tracking-wider mb-1 font-bold">
                      Platform Intent
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterRole("buyer")}
                        className={`flex-1 py-1.5 px-2 border text-xs font-semibold rounded-lg text-center transition cursor-pointer ${
                          registerRole === "buyer"
                            ? "bg-pink-600/20 border-pink-550 text-pink-400"
                            : "bg-gray-950 border-gray-850 text-gray-400"
                        }`}
                      >
                        I want to Buy
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterRole("seller")}
                        className={`flex-1 py-1.5 px-2 border text-xs font-semibold rounded-lg text-center transition cursor-pointer ${
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
                </form>
              )}

              {/* TAB 3: RESET FORGOT PASSWORD */}
              {activeFormTab === "FORGOT_PASSWORD" && (
                <form
                  onSubmit={handleForgotPasswordSubmit}
                  className="space-y-3"
                >
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
                      placeholder="Enter 10-digit number"
                      maxLength={10}
                      className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
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
                      placeholder="Minimum 6 characters"
                      className="w-full px-3 py-1.5 bg-gray-950 border border-gray-850 rounded-lg text-white text-xs focus:border-pink-500 focus:outline-none"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-2 bg-pink-600 hover:bg-pink-550 disabled:opacity-50 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-all cursor-pointer"
                  >
                    {isPending ? "Resetting..." : "Update Passcode Safely"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Headless Google One Tap component to trigger native prompts */}
        <GoogleOneTap
          clientId={clientId}
          gsiLoaded={gsiLoaded}
          onLoginSuccess={onLoginSuccess}
          setErrorMsg={setErrorMsg}
          setSuccessMsg={setSuccessMsg}
        />
      </main>
    </div>
  );
}
