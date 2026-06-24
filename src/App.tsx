import React, { useState, useEffect, useTransition } from "react";
import {
  Ticket,
  Compass,
  PlusSquare,
  MessageSquare,
  Wallet as WalletIcon,
  Settings,
  Users,
  ShieldAlert,
  Sparkles,
  Filter,
  Trash2,
  ArrowRight,
  Info,
  ShieldCheck,
  Heart,
  CircleDot,
  AlertTriangle,
  ChevronRight,
  HelpCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";

const LandingPage = React.lazy(() => import("./components/LandingPage"));
const ListingForm = React.lazy(() => import("./components/ListingForm"));
const WalletTab = React.lazy(() => import("./components/WalletTab"));
const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
const ChatRoom = React.lazy(() => import("./components/ChatRoom"));
const LoginPage = React.lazy(() => import("./components/LoginPage"));

import { SYSTEM_PERSONAS } from "./data";
import { Listing, Transaction, Wallet, Persona } from "./types";

export default function App() {
  // Custom user registered accounts
  const [customPersonas, setCustomPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem("ticketswap_custom_personas");
    return saved ? JSON.parse(saved) : [];
  });

  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem("ticketswap_is_logged_in");
    return saved === "true";
  });

  // Routing helper functions to map tabs to clean URL paths and vice-versa
  const tabToPath = (tab: string) => {
    switch (tab) {
      case "HOME":
        return "/overview";
      case "BROWSE":
        return "/browse";
      case "POST":
        return "/post-ticket";
      case "MESSAGES":
        return "/messages";
      case "WALLET":
        return "/wallet";
      case "ADMIN":
        return "/admin";
      default:
        return "/overview";
    }
  };

  const pathToTab = (path: string) => {
    switch (path) {
      case "/":
      case "/overview":
        return "HOME";
      case "/browse":
        return "BROWSE";
      case "/post-ticket":
        return "POST";
      case "/messages":
        return "MESSAGES";
      case "/wallet":
        return "WALLET";
      case "/admin":
        return "ADMIN";
      default:
        return "HOME";
    }
  };

  // Personas toggling state
  const [activePersona, setActivePersona] = useState<Persona>(() => {
    const saved = localStorage.getItem("ticketswap_active_persona");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Ignored
      }
    }
    return SYSTEM_PERSONAS[0]; // Default: Raghu (Buyer)
  });

  // Dynamically compute allPersonas ensuring the logged-in persona is always included in the sandbox header
  const allPersonas = [...SYSTEM_PERSONAS, ...customPersonas];
  if (
    isLoggedIn &&
    activePersona &&
    !allPersonas.some((p) => p.id === activePersona.id)
  ) {
    allPersonas.push(activePersona);
  }

  const [isPending, startTransition] = useTransition();

  // Navigation tabs synced with client-side URL pathing
  const [activeTab, setActiveTab] = useState<
    "HOME" | "BROWSE" | "POST" | "MESSAGES" | "WALLET" | "ADMIN"
  >(() => {
    return pathToTab(window.location.pathname);
  });

  // Modern navigation helper utilizing React 19 transitions and bypassing duplicate useEffect hooks
  const navigate = (
    tab: "HOME" | "BROWSE" | "POST" | "MESSAGES" | "WALLET" | "ADMIN",
    personaId = activePersona.id,
  ) => {
    startTransition(async () => {
      setActiveTab(tab);
      const targetPath = tabToPath(tab);
      if (window.location.pathname !== targetPath) {
        window.history.pushState(null, "", targetPath);
      }
      await syncBackendData(tab, personaId);
    });
  };

  // Setup single on-mount and popstate event-driven router handler
  useEffect(() => {
    const handlePopState = () => {
      if (!isLoggedIn) {
        if (window.location.pathname !== "/login") {
          window.history.replaceState(null, "", "/login");
        }
        return;
      }
      const newTab = pathToTab(window.location.pathname);
      setActiveTab(newTab);
      syncBackendData(newTab, activePersona.id);
    };

    // Execute on initial mount to load data matching current pathname
    handlePopState();

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLoggedIn, activePersona.id]);

  // Data lists
  const [listings, setListings] = useState<Listing[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeWallet, setActiveWallet] = useState<Wallet | null>(null);

  // Search/Filters (Browse page)
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "SAVINGS_HIGH">("ALL");

  // Interactive details & checkout simulations
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [viewingChatTxId, setViewingChatTxId] = useState<string | null>(null);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<"CONNECT" | "SAFE" | null>(
    null,
  );
  const [checkoutStep, setCheckoutStep] = useState<
    "DETAILS" | "PAYING" | "SUCCESS"
  >("DETAILS");
  const [checkoutError, setCheckoutError] = useState("");

  const [globalError, setGlobalError] = useState("");
  const [globalSuccess, setGlobalSuccess] = useState("");
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Sync tab-specific data from backend to avoid redundant requests
  const syncBackendData = async (
    tab = activeTab,
    personaId = activePersona.id,
  ) => {
    if (!personaId) return;
    try {
      // 1. Fetch listings only when viewing Home or Browse resale tickets
      if (tab === "HOME" || tab === "BROWSE") {
        const resListings = await fetch("/api/listings");
        const listData = await resListings.json();
        setListings(listData);
      }

      // 2. Fetch admin stats/transactions only when viewing Home, Swaps (MESSAGES) or Admin Ops
      if (tab === "HOME" || tab === "MESSAGES" || tab === "ADMIN") {
        const resStats = await fetch("/api/admin/stats");
        const stats = await resStats.json();
        setTransactions(stats.transactions);
      }

      // 3. Fetch active user wallet balance only when viewing Wallet or Home dashboard
      if (tab === "WALLET" || tab === "HOME") {
        const resWallet = await fetch(`/api/wallets/${personaId}`);
        const walletData = await resWallet.json();
        setActiveWallet(walletData);
      }
    } catch (err) {
      console.error("Data synchronization failed:", err);
    }
  };

  const handleCreateListing = async (formData: any) => {
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          sellerId: activePersona.id,
          sellerName: activePersona.name,
        }),
      });
      if (res.ok) {
        setGlobalSuccess(
          "Movie listing posted successfully! Available to browse instantly.",
        );
        navigate("BROWSE");
        setTimeout(() => setGlobalSuccess(""), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectListingToBuy = (listing: Listing) => {
    setSelectedListing(listing);
    setCheckoutStep("DETAILS");
    setCheckoutError("");
  };

  // Start Razorpay Checkout workflow simulator
  const handleCheckoutSubmit = async (mode: "CONNECT" | "SAFE") => {
    if (!selectedListing || !activeWallet) return;
    setCheckoutMode(mode);
    setCheckoutStep("PAYING");
    setCheckoutError("");

    const platformFee = mode === "CONNECT" ? 5 : 10; // default commission ₹10 for Safe mode
    const totalCost =
      mode === "CONNECT" ? 5 : selectedListing.sellingPrice + platformFee;

    // Simulate Payment gateway delay (1.5 seconds)
    setTimeout(async () => {
      try {
        const res = await fetch("/api/transactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: selectedListing.id,
            buyerId: activePersona.id,
            buyerName: activePersona.name,
            mode,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          setCheckoutStep("SUCCESS");
          syncBackendData();
          // After success details, auto transition to chat in a bit
          setTimeout(() => {
            setSelectedListing(null);
            setViewingChatTxId(data.transaction.id);
            navigate("MESSAGES");
          }, 24000); // give ample time or users can click button
        } else {
          const data = await res.json();
          setCheckoutStep("DETAILS");
          setCheckoutError(data.error || "Payment gateway deduction failed.");
        }
      } catch (err) {
        setCheckoutStep("DETAILS");
        setCheckoutError("System checkout failure. Try again.");
      }
    }, 1500);
  };

  const handleWalletRefill = async () => {
    try {
      const res = await fetch(`/api/wallets/${activePersona.id}/refill`, {
        method: "POST",
      });
      const walletData = await res.json();
      setActiveWallet(walletData);
      setGlobalSuccess(
        "Demo Wallet funded with ₹500 successfully via simulated Razorpay UPI!",
      );
      setTimeout(() => setGlobalSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleWalletWithdraw = async (amount: number) => {
    const res = await fetch(`/api/wallets/${activePersona.id}/withdraw`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Withdrawal failed");
    }
    const walletData = await res.json();
    setActiveWallet(walletData);
  };

  // Filter listings
  const filteredListings = listings.filter((l) => {
    // Exclude own listings from browse for pure buying test logic, or show them beautifully
    const matchesSearch =
      l.movieName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.theatreName.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === "SAVINGS_HIGH") {
      return l.originalPrice - l.sellingPrice >= 100;
    }
    return true;
  });

  // Count active chats for user
  const userTransactions = transactions.filter(
    (t) => t.buyerId === activePersona.id || t.sellerId === activePersona.id,
  );

  if (!isLoggedIn) {
    return (
      <React.Suspense
        fallback={
          <div className="min-h-screen bg-gray-950 text-white flex justify-center items-center">
            <div className="w-10 h-10 rounded-full border-4 border-pink-500/10 border-t-pink-500 animate-spin" />
          </div>
        }
      >
        <LoginPage
          onLoginSuccess={(persona) => {
            setActivePersona(persona);
            localStorage.setItem(
              "ticketswap_active_persona",
              JSON.stringify(persona),
            );
            setIsLoggedIn(true);
            localStorage.setItem("ticketswap_is_logged_in", "true");

            // Auto-persist successfully logged-in user to the local workspace custom switchers if not present
            const isSystem = SYSTEM_PERSONAS.some((p) => p.id === persona.id);
            const isCustom = customPersonas.some((p) => p.id === persona.id);
            if (!isSystem && !isCustom) {
              const updated = [...customPersonas, persona];
              setCustomPersonas(updated);
              localStorage.setItem(
                "ticketswap_custom_personas",
                JSON.stringify(updated),
              );
            }

            const targetTab = persona.role === "admin" ? "ADMIN" : "HOME";
            navigate(targetTab, persona.id);
          }}
          allPersonas={allPersonas}
          onRegisterSuccess={(newPersona) => {
            const updated = [...customPersonas, newPersona];
            setCustomPersonas(updated);
            localStorage.setItem(
              "ticketswap_custom_personas",
              JSON.stringify(updated),
            );
          }}
        />
      </React.Suspense>
    );
  }

  const isSystemPersona = SYSTEM_PERSONAS.some(
    (p) => p.id === activePersona.id,
  );

  return (
    <div
      className={`min-h-screen flex flex-col justify-between font-sans selection:bg-pink-600 selection:text-white transition-colors duration-200 ${
        isDarkMode ? "bg-gray-950 text-gray-100" : "bg-slate-50 text-slate-800"
      }`}
      id="main-container"
    >
      {/* 1. Global Role Switcher & Persona Toolbar */}
      {isSystemPersona && (
        <div
          className={`py-3 px-4 border-b sticky top-0 z-50 shadow-md transition-colors duration-250 ${
            isDarkMode
              ? "bg-gray-950 border-gray-850"
              : "bg-white border-slate-200 text-slate-900"
          }`}
        >
          <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span
                className={`text-[10px] font-mono tracking-widest uppercase ${
                  isDarkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                SANDBOX SIMULATOR WORKSPACE
              </span>

              {/* Dark & Light theme toggle switch */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-1 rounded-lg border transition flex items-center gap-1 cursor-pointer text-xs font-semibold ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-800 text-yellow-400 hover:bg-gray-800"
                    : "bg-slate-100 border-slate-300 text-indigo-600 hover:bg-slate-200"
                }`}
                title="Toggle Dark / Light Mode"
                id="theme-toggler"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">
                      Light
                    </span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-mono uppercase">
                      Dark
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-gray-400 text-xs font-semibold mr-1 flex items-center gap-1 font-mono">
                <Users className="w-3.5 h-3.5 text-pink-400" />
                Active User Persona:
              </span>
              {allPersonas.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActivePersona(p);
                    localStorage.setItem(
                      "ticketswap_active_persona",
                      JSON.stringify(p),
                    );
                    setViewingChatTxId(null);
                    setCheckoutError("");
                    // Auto route appropriately using navigate under transition
                    const targetTab = p.role === "admin" ? "ADMIN" : "HOME";
                    navigate(targetTab, p.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium font-mono transition flex items-center gap-1 cursor-pointer ${
                    activePersona.id === p.id
                      ? "bg-pink-600 border border-pink-500/30 text-white shadow shadow-pink-900/30"
                      : "bg-gray-900 border border-gray-800 text-gray-300 hover:bg-gray-850 hover:text-white"
                  }`}
                >
                  <img
                    src={p.avatar}
                    className="w-4 h-4 rounded-full object-cover shrink-0"
                    alt=""
                  />
                  <span className="capitalize">
                    {p.name.split(" ")[0]} ({p.role})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Top Header Navigation (Glassmorphic) */}
      <header
        className={`backdrop-blur-md border-b sticky z-[40] transition-all duration-200 ${
          isSystemPersona ? "top-[108px] md:top-[63px]" : "top-0"
        } ${
          isDarkMode
            ? "bg-gray-950/70 border-gray-850 text-white"
            : "bg-white/85 border-slate-200 text-slate-950"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          {/* Logo brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => navigate("HOME")}
          >
            <div className="p-2 bg-gradient-to-tr from-pink-600 to-indigo-600 rounded-xl text-white shadow shadow-pink-900/20">
              <Ticket className="w-5 h-5 rotate-12" />
            </div>
            <div>
              <span
                className={`text-lg font-bold font-display tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                Ticket<span className="text-pink-500">Swap</span>
              </span>
              <p className="text-[8px] font-mono tracking-widest text-zinc-500 uppercase leading-none mt-0.5">
                RESALE PLATFORM
              </p>
            </div>
          </div>

          {/* Nav buttons */}
          <nav className="flex flex-wrap items-center justify-center gap-1 md:gap-2">
            <button
              onClick={() => navigate("HOME")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 flex items-center gap-1 cursor-pointer ${
                activeTab === "HOME"
                  ? isDarkMode
                    ? "bg-zinc-900 text-pink-500"
                    : "bg-pink-50 text-pink-600"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-zinc-900/45"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Overview"
            >
              <Compass className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Overview</span>
            </button>

            <button
              onClick={() => navigate("BROWSE")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 flex items-center gap-1 cursor-pointer ${
                activeTab === "BROWSE"
                  ? isDarkMode
                    ? "bg-zinc-900 text-pink-500"
                    : "bg-pink-50 text-pink-600"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-zinc-900/45"
                    : "text-slate-600 hover:text-slate-955 hover:bg-slate-100"
              }`}
              title="Browse tickets"
            >
              <Filter className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Browse</span>
            </button>

            {activePersona.role !== "admin" && (
              <button
                onClick={() => navigate("POST")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 flex items-center gap-1 cursor-pointer ${
                  activeTab === "POST"
                    ? isDarkMode
                      ? "bg-zinc-900 text-pink-500"
                      : "bg-pink-50 text-pink-600"
                    : isDarkMode
                      ? "text-gray-400 hover:text-white hover:bg-zinc-900/45"
                      : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
                }`}
                title="Post Ticket"
              >
                <PlusSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-sans">Post Ticket</span>
              </button>
            )}

            <button
              onClick={() => navigate("MESSAGES")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 flex items-center gap-1 relative cursor-pointer ${
                activeTab === "MESSAGES"
                  ? isDarkMode
                    ? "bg-zinc-900 text-pink-500"
                    : "bg-pink-50 text-pink-600"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-zinc-900/45"
                    : "text-slate-600 hover:text-slate-950 hover:bg-slate-100"
              }`}
              title="Active Swaps & Chats"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Swaps</span>
              {userTransactions.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 border border-gray-950 text-white rounded-full font-bold text-[9px] w-4.5 h-4.5 flex items-center justify-center font-mono animate-pulse">
                  {userTransactions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate("WALLET")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display transition duration-150 flex items-center gap-1 cursor-pointer ${
                activeTab === "WALLET"
                  ? isDarkMode
                    ? "bg-zinc-900 text-pink-500"
                    : "bg-pink-50 text-pink-600"
                  : isDarkMode
                    ? "text-gray-400 hover:text-white hover:bg-zinc-900/45"
                    : "text-slate-600 hover:text-slate-955 hover:bg-slate-100"
              }`}
              title="Wallet & Balance"
            >
              <WalletIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Wallet</span>
              {activeWallet && (
                <span className="hidden md:inline font-mono text-xs px-1">
                  (₹{activeWallet.balance})
                </span>
              )}
            </button>

            {activePersona.role === "admin" && (
              <button
                onClick={() => navigate("ADMIN")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display border border-red-500/20 bg-red-500/10 text-red-400 transition duration-150 flex items-center gap-1 cursor-pointer`}
                title="Admin Ops"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Admin Ops</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 md:p-2 rounded-lg border transition duration-150 flex items-center justify-center cursor-pointer ${
                isDarkMode
                  ? "bg-zinc-900 border-zinc-800 text-yellow-400 hover:bg-zinc-850"
                  : "bg-slate-100 border-slate-200 text-indigo-600 hover:bg-slate-200"
              }`}
              title="Toggle Dark/Light Mode"
              id="header-theme-toggle"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5" />
              ) : (
                <Moon className="w-3.5 h-3.5" />
              )}
            </button>

            <button
              onClick={() => {
                startTransition(() => {
                  setIsLoggedIn(false);
                  localStorage.removeItem("ticketswap_is_logged_in");
                  localStorage.removeItem("ticketswap_active_persona");
                  setActivePersona(SYSTEM_PERSONAS[0]);
                  setActiveTab("HOME");
                  window.history.pushState(null, "", "/login");
                });
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold font-display border transition duration-150 flex items-center gap-1 cursor-pointer ${
                isDarkMode
                  ? "bg-gray-900 border-gray-800 text-gray-400 hover:text-white hover:bg-gray-850"
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200"
              }`}
              title="Sign out of your active session"
              id="logout-button"
            >
              <LogOut className="w-3.5 h-3.5 text-pink-500 shrink-0" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {/* Global Notifications Alert Widget */}
        {(globalError || globalSuccess) && (
          <div className="max-w-4xl mx-auto px-4 mt-4">
            <div
              className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                globalError
                  ? "bg-rose-500/15 border-rose-500/20 text-rose-400"
                  : "bg-emerald-500/15 border-emerald-500/20 text-emerald-400"
              }`}
            >
              <Info className="w-4 h-4 shrink-0" />
              <span>{globalError || globalSuccess}</span>
            </div>
          </div>
        )}

        {/* ==================== SCREEN SWITCHBOARD ==================== */}
        <React.Suspense
          fallback={
            <div className="flex justify-center items-center py-20 text-white">
              <div className="w-8 h-8 rounded-full border-4 border-pink-500/10 border-t-pink-500 animate-spin" />
            </div>
          }
        >
          {/* TAB 1: HOME LANDING PAGE */}
          {activeTab === "HOME" && (
            <LandingPage
              onStartBrowsing={() => navigate("BROWSE")}
              onPostListing={() => navigate("POST")}
              isDarkMode={isDarkMode}
            />
          )}

          {/* TAB 2: BROWSE RESALE TICKETS GALLERY */}
          {activeTab === "BROWSE" && (
            <div className="browse-container max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
              <div className="browse-gallery-header flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 sm:mb-8">
                <div>
                  <h2
                    className={`text-2xl sm:text-3xl font-extrabold font-display ${isDarkMode ? "text-white" : "text-slate-900"}`}
                    id="browse-gallery-title"
                  >
                    Available Resale Tickets
                  </h2>
                  <p
                    className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                  >
                    Guaranteed cheaper than original price. Choose Safe Mode for
                    100% escrow protection.
                  </p>
                </div>

                {/* Filters / Search Bar row */}
                <div
                  className="flex flex-col sm:flex-row items-center gap-2.5"
                  role="search"
                  aria-label="Filter resales"
                >
                  <input
                    type="text"
                    placeholder="Search film title or cinema venue..."
                    className={`w-full sm:w-64 px-4 py-2.5 sm:py-2 border rounded-xl text-xs focus:border-pink-500 focus:outline-none placeholder-gray-500 touch-target-input transition ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-800 text-white"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    aria-label="Search movie title or theatre venue name"
                  />

                  <div
                    className={`flex gap-1.5 p-1 rounded-xl border w-full sm:w-auto font-sans transition ${
                      isDarkMode
                        ? "bg-gray-900 border-gray-800/60"
                        : "bg-white border-slate-200 shadow-sm"
                    }`}
                    role="group"
                    aria-label="Discount rate filter toggle options"
                  >
                    <button
                      onClick={() => setFilterMode("ALL")}
                      aria-pressed={filterMode === "ALL"}
                      className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition touch-target-btn ${
                        filterMode === "ALL"
                          ? "bg-pink-600 text-white shadow"
                          : isDarkMode
                            ? "text-gray-400 hover:text-white"
                            : "text-slate-550 hover:text-slate-800"
                      }`}
                    >
                      All Seats
                    </button>
                    <button
                      onClick={() => setFilterMode("SAVINGS_HIGH")}
                      aria-pressed={filterMode === "SAVINGS_HIGH"}
                      className={`flex-1 sm:flex-initial px-3 py-2 sm:py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition touch-target-btn ${
                        filterMode === "SAVINGS_HIGH"
                          ? "bg-pink-600 text-white shadow"
                          : isDarkMode
                            ? "text-gray-400 hover:text-white"
                            : "text-slate-550 hover:text-slate-800"
                      }`}
                    >
                      High Savings (₹100+)
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid checklist */}
              {filteredListings.length === 0 ? (
                <div
                  className={`text-center py-20 rounded-2xl p-6 border ${
                    isDarkMode
                      ? "bg-gray-900/20 border-gray-850"
                      : "bg-white border-slate-200 shadow-sm"
                  }`}
                  role="status"
                >
                  <Ticket
                    className="w-12 h-12 text-zinc-650 mx-auto mb-4 stroke-1 animate-pulse"
                    aria-hidden="true"
                  />
                  <h4
                    className={`font-bold font-display ${isDarkMode ? "text-white" : "text-slate-800"}`}
                  >
                    No Available Resales Found
                  </h4>
                  <p
                    className={`text-xs mt-1 leading-normal max-w-sm mx-auto ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}
                  >
                    No tickets match your parameters. Switch to user <b>Maya</b>{" "}
                    or <b>Priya</b> and click <b>Post Resale</b> to list.
                  </p>
                </div>
              ) : (
                <div
                  className="browse-gallery-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
                  aria-labelledby="browse-gallery-title"
                >
                  {filteredListings.map((l) => {
                    const savings = l.originalPrice - l.sellingPrice;
                    const isOwnListing = l.sellerId === activePersona.id;

                    return (
                      <article
                        key={l.id}
                        className={`rounded-2xl overflow-hidden flex flex-col justify-between group border transition-all duration-200 relative ${
                          isDarkMode ? "glass-card" : "bg-white shadow-sm"
                        } ${
                          isOwnListing
                            ? isDarkMode
                              ? "border-indigo-500/25 bg-indigo-500/5"
                              : "border-indigo-200 bg-indigo-50/10"
                            : isDarkMode
                              ? "border-gray-800 hover:border-pink-500/40 hover:-translate-y-1"
                              : "border-slate-200 hover:border-pink-300 hover:shadow-md hover:-translate-y-1"
                        }`}
                        aria-label={`Resale seat details for ${l.movieName}`}
                      >
                        {/* Badge tags */}
                        <div
                          className="absolute top-3.5 left-3.5 z-10 flex gap-1.5"
                          aria-hidden="true"
                        >
                          <span
                            className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase ${
                              l.status === "AVAILABLE"
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {l.status}
                          </span>

                          {isOwnListing && (
                            <span className="px-2 py-0.5 text-[9px] font-mono rounded font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                              YOUR LISTING
                            </span>
                          )}
                        </div>

                        {/* savings tag */}
                        {savings > 0 && (
                          <div
                            className="absolute top-3.5 right-3.5 z-10 bg-emerald-500 text-white font-bold text-[10px] px-2 py-0.5 rounded font-mono shadow-md"
                            aria-label={`₹${savings} off original original rate`}
                          >
                            ₹{savings} Saved
                          </div>
                        )}

                        {/* Header image card */}
                        <div className="browse-card-image relative aspect-video bg-zinc-950 overflow-hidden">
                          <img
                            referrerPolicy="no-referrer"
                            src={l.screenshotUrl}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            alt={`Cinema screen preview screenshot showing ${l.movieName}`}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
                        </div>

                        {/* Content panel */}
                        <div className="browse-card-content p-4 sm:p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <h3
                              className={`text-lg font-bold font-display tracking-tight capitalize truncate ${
                                isDarkMode ? "text-white" : "text-slate-800"
                              }`}
                            >
                              {l.movieName}
                            </h3>

                            <p
                              className={`text-xs mt-1.5 leading-normal truncate ${
                                isDarkMode ? "text-gray-400" : "text-slate-600"
                              }`}
                            >
                              📍 {l.theatreName}
                            </p>

                            <div
                              className={`mt-4 grid grid-cols-2 gap-4 border-t border-b py-3 text-xs ${
                                isDarkMode
                                  ? "border-gray-850/60"
                                  : "border-slate-100"
                              }`}
                            >
                              <div>
                                <p
                                  className={`text-[9px] font-mono uppercase ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                                >
                                  Date / Showtime
                                </p>
                                <p
                                  className={`font-semibold mt-0.5 truncate uppercase ${isDarkMode ? "text-white" : "text-slate-700"}`}
                                >
                                  {new Date(l.showTime).toLocaleString(
                                    undefined,
                                    { dateStyle: "short", timeStyle: "short" },
                                  )}
                                </p>
                              </div>

                              <div>
                                <p
                                  className={`text-[9px] font-mono uppercase ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                                >
                                  Seat coordinates
                                </p>
                                <p
                                  className={`font-semibold mt-0.5 truncate uppercase ${isDarkMode ? "text-white" : "text-slate-700"}`}
                                >
                                  {l.seatNumber}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Pricing section and Swapping match details */}
                          <div className="browse-card-actions mt-4 sm:mt-5">
                            <div className="flex items-end justify-between mb-4">
                              <div>
                                <p
                                  className={`text-[9px] font-mono ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                                >
                                  ORIGINAL PRICE
                                </p>
                                <p
                                  className={`text-xs line-through ${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                                >
                                  ₹{l.originalPrice}
                                </p>
                              </div>

                              <div className="text-right">
                                <p
                                  className={`text-[9px] font-mono font-bold ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                                >
                                  SWAP PRICE
                                </p>
                                <p
                                  className={`text-xl font-extrabold font-display ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                                >
                                  ₹{l.sellingPrice}
                                </p>
                              </div>
                            </div>

                            {isOwnListing ? (
                              <div
                                className={`text-center p-2.5 rounded-xl text-xs font-mono font-bold ${
                                  isDarkMode
                                    ? "bg-indigo-500/5 text-indigo-400"
                                    : "bg-indigo-50 text-indigo-600"
                                }`}
                              >
                                Manage on Chats tab
                              </div>
                            ) : l.status === "AVAILABLE" ? (
                              <button
                                onClick={() => handleSelectListingToBuy(l)}
                                aria-label={`Initiate escrow purchase swap process for movie ticket seat ${l.seatNumber} of ${l.movieName} at discount rate ₹${l.sellingPrice}`}
                                className="touch-target-btn w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold font-display rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
                              >
                                Get Ticket Resale
                                <ArrowRight
                                  className="w-3.5 h-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            ) : (
                              <div
                                className={`text-center p-2.5 rounded-xl text-xs font-bold ${
                                  isDarkMode
                                    ? "bg-gray-900 text-gray-500"
                                    : "bg-slate-100 text-slate-450"
                                }`}
                              >
                                Locked / swapped
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: POST RESALE LISTINGS */}
          {activeTab === "POST" && (
            <ListingForm
              onSubmit={handleCreateListing}
              onCancel={() => navigate("BROWSE")}
              sellerName={activePersona.name}
            />
          )}

          {/* TAB 4: ACTIVE MESSAGES / SWAPS SCREEN */}
          {activeTab === "MESSAGES" && (
            <div>
              {viewingChatTxId ? (
                <ChatRoom
                  transactionId={viewingChatTxId}
                  activeUserId={activePersona.id}
                  activeUserName={activePersona.name}
                  onStatusUpdate={syncBackendData}
                />
              ) : (
                <div className="max-w-4xl mx-auto px-4 py-8">
                  <h2
                    className={`text-3xl font-extrabold font-display mb-2 ${isDarkMode ? "text-white" : "text-slate-900"}`}
                  >
                    My Active Ticket Swaps
                  </h2>
                  <p
                    className={`text-xs mb-8 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                  >
                    Check match statuses, coordinate physically, and release
                    securely held escrow cash.
                  </p>

                  {userTransactions.length === 0 ? (
                    <div
                      className={`text-center py-20 rounded-2xl p-6 border ${
                        isDarkMode
                          ? "bg-gray-900/20 border-gray-850"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4 animate-bounce" />
                      <h4
                        className={`font-display font-bold ${isDarkMode ? "text-white" : "text-slate-800"}`}
                      >
                        No Active Swap Match Initiated
                      </h4>
                      <p
                        className={`text-xs mt-1 max-w-sm mx-auto leading-normal ${isDarkMode ? "text-gray-500" : "text-slate-500"}`}
                      >
                        You are not currently processing any buying connections
                        or selling transactions. Go to <b>Browse</b> to buy a
                        ticket!
                      </p>
                    </div>
                  ) : (
                    <div
                      className={`border rounded-2xl overflow-hidden divide-y ${
                        isDarkMode
                          ? "divide-gray-850 border-gray-850 bg-gray-900/40"
                          : "divide-slate-100 border-slate-200 bg-white shadow-sm"
                      }`}
                    >
                      {userTransactions
                        .slice()
                        .reverse()
                        .map((tx) => {
                          const associatedListing = listings.find(
                            (l) => l.id === tx.listingId,
                          );
                          const isBuyerMe = tx.buyerId === activePersona.id;
                          const partnerName = isBuyerMe
                            ? tx.sellerName
                            : tx.buyerName;

                          return (
                            <div
                              key={tx.id}
                              onClick={() => setViewingChatTxId(tx.id)}
                              className={`p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer transition ${
                                isDarkMode
                                  ? "hover:bg-gray-950/50"
                                  : "hover:bg-slate-50"
                              }`}
                            >
                              <div className="flex items-center gap-3.5">
                                <div
                                  className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold shrink-0 text-pink-500 ${
                                    isDarkMode
                                      ? "bg-indigo-500/10 border-indigo-500/20"
                                      : "bg-pink-50 border-pink-100"
                                  }`}
                                >
                                  {partnerName.substring(0, 1)}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4
                                      className={`text-sm font-bold capitalize ${isDarkMode ? "text-white" : "text-slate-800"}`}
                                    >
                                      {associatedListing
                                        ? associatedListing.movieName
                                        : "Ticket Swap"}
                                    </h4>
                                    <span
                                      className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase ${
                                        tx.mode === "CONNECT"
                                          ? isDarkMode
                                            ? "bg-indigo-500/10 text-indigo-400"
                                            : "bg-indigo-50 text-indigo-600"
                                          : isDarkMode
                                            ? "bg-pink-500/10 text-pink-400"
                                            : "bg-pink-50 text-pink-600"
                                      }`}
                                    >
                                      {tx.mode} Mode
                                    </span>
                                  </div>

                                  <p
                                    className={`text-xs truncate mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
                                  >
                                    Matching Swap partner: <b>{partnerName}</b>{" "}
                                    (
                                    {isBuyerMe
                                      ? "You are Buyer"
                                      : "You are Seller"}
                                    )
                                  </p>

                                  <p
                                    className={`text-[10px] font-mono mt-1 flex items-center gap-1.5 uppercase ${
                                      isDarkMode
                                        ? "text-gray-500"
                                        : "text-slate-500"
                                    }`}
                                  >
                                    <CircleDot className="w-2.5 h-2.5 text-pink-500" />
                                    MATCH STATUS: {tx.status}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-auto uppercase">
                                <span
                                  className={`font-mono text-xs font-bold mr-1 ${isDarkMode ? "text-gray-400" : "text-slate-700"}`}
                                >
                                  ₹
                                  {associatedListing
                                    ? associatedListing.sellingPrice
                                    : "0"}
                                </span>
                                <div className="px-4 py-2 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold font-display flex items-center gap-1 transition">
                                  Open Swap Portal
                                  <ChevronRight className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WALLET LEDGERS & WITHDRAWALS */}
          {activeTab === "WALLET" && activeWallet && (
            <WalletTab
              wallet={activeWallet}
              userName={activePersona.name}
              onRefill={handleWalletRefill}
              onWithdraw={handleWalletWithdraw}
            />
          )}

          {/* TAB 6: ADMIN CONTROL PANEL PANEL */}
          {activeTab === "ADMIN" && activePersona.role === "admin" && (
            <AdminPanel
              onDisputeResolved={syncBackendData}
              onRefreshAllLists={syncBackendData}
            />
          )}
        </React.Suspense>
      </main>

      {/* FOOTER METADATA */}
      <footer className="bg-gray-950 border-t border-gray-850 py-6 text-center text-zinc-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p>
            © 2026 TicketSwap Inc. All rights reserved. Platform secure escrow
            commission operates at default ₹10 per ticket trade transaction.
          </p>
          <div className="flex justify-center items-center gap-3.5 text-[11px] text-zinc-650 font-mono">
            <span>
              Development App URL:
              https://ais-dev-lwuzbioaepmjeoyupuvtj4-692488307747.asia-east1.run.app
            </span>
            <span>•</span>
            <span>Local Time: 07:02:51 IST</span>
          </div>
        </div>
      </footer>

      {/* ==================== 3. CHECKOUT MODAL WORKFLOW POPUP ==================== */}
      {selectedListing && (
        <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-lg w-full p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => setSelectedListing(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white text-xs cursor-pointer"
            >
              ✕ Close
            </button>

            {checkoutStep === "DETAILS" && (
              <div className="space-y-6">
                {/* Title block */}
                <div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-bold rounded font-mono uppercase">
                    You Save ₹
                    {selectedListing.originalPrice -
                      selectedListing.sellingPrice}
                    !
                  </span>
                  <h3 className="text-2xl font-bold font-display text-white mt-2 leading-snug">
                    Resale: {selectedListing.movieName}
                  </h3>
                  <p className="text-gray-400 text-xs mt-1">
                    📍 Theatre Venue: {selectedListing.theatreName}
                  </p>
                </div>

                {checkoutError && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
                    ⚠️ {checkoutError}
                  </div>
                )}

                {/* Grid stats */}
                <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-zinc-950/40 p-4 border border-zinc-850 rounded-xl">
                  <div>
                    <span className="text-gray-500 block">
                      Show Time starts:
                    </span>
                    <span className="text-white mt-1 block font-bold">
                      {new Date(selectedListing.showTime).toLocaleString(
                        undefined,
                        { dateStyle: "short", timeStyle: "short" },
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">
                      Seat coordinates:
                    </span>
                    <span className="text-white mt-1 block font-bold text-glow font-display">
                      {selectedListing.seatNumber}
                    </span>
                  </div>
                  <div className="border-t border-zinc-850 pt-2">
                    <span className="text-gray-500 block">Original Price:</span>
                    <span className="text-gray-500 line-through">
                      ₹{selectedListing.originalPrice}
                    </span>
                  </div>
                  <div className="border-t border-zinc-850 pt-2">
                    <span className="text-pink-400 block font-bold">
                      Swap resale price:
                    </span>
                    <span className="text-pink-400 text-base font-extrabold font-display">
                      ₹{selectedListing.sellingPrice}
                    </span>
                  </div>
                </div>

                {/* Mode Selectors */}
                <div className="space-y-4">
                  <div className="text-xs uppercase font-mono tracking-wider font-bold text-gray-400">
                    Select Your Resale Protection Mode:
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Connect Mode selection */}
                    <div className="p-4 bg-indigo-950/15 border border-indigo-500/25 rounded-xl space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-indigo-400 font-display flex items-center gap-1">
                          Connect Mode Match
                        </h4>
                        <p className="text-gray-400 text-[10.5px] leading-relaxed mt-1">
                          Pay ₹5 platform fee. Connect & chat directly. Swap
                          physically & pay cash/UPI on your own.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckoutSubmit("CONNECT")}
                        className="w-full mt-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs tracking-wider transition cursor-pointer text-center"
                      >
                        Swap for ₹5 fee
                      </button>
                    </div>

                    {/* Safe Mode selection */}
                    <div className="p-4 bg-pink-950/15 border border-pink-500/30 rounded-xl border-l-4 border-l-pink-500 space-y-2 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-pink-400 font-display">
                          Safe Escrow Mode
                        </h4>
                        <p className="text-gray-400 text-[10.5px] leading-relaxed mt-1">
                          Secure funds of ₹{selectedListing.sellingPrice} + ₹10
                          plat commission held safely on escrow until physical
                          inspection.
                        </p>
                      </div>
                      <button
                        onClick={() => handleCheckoutSubmit("SAFE")}
                        className="w-full mt-3 py-2 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs tracking-wider transition cursor-pointer text-center"
                      >
                        Buy Securely for ₹{selectedListing.sellingPrice + 10}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 text-center leading-normal">
                  Money is deducted from your Swap Wallet. Refill balance in the
                  Wallet tab if funds are low.
                </div>
              </div>
            )}

            {checkoutStep === "PAYING" && (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-6">
                {/* Simulated Payment Processing wheel */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-pink-600/10 border-t-pink-500 animate-spin" />
                  <Ticket className="w-6 h-6 text-pink-500 hover:scale-110 transition absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-lg font-bold font-display text-white">
                    Razorpay Secure Integration
                  </h4>
                  <p className="text-gray-405 text-xs">
                    Simulating bank settlement deduction, routing ₹
                    {checkoutMode === "CONNECT"
                      ? 5
                      : selectedListing.sellingPrice + 10}{" "}
                    via Sandbox UPI gateway...
                  </p>
                </div>
              </div>
            )}

            {checkoutStep === "SUCCESS" && (
              <div className="py-8 text-center space-y-6">
                {/* Verified checked mark */}
                <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldCheck className="w-8 h-8 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h4 className="text-xl font-bold font-display text-white">
                    Resale Match Registered!
                  </h4>
                  <p className="text-gray-400 text-xs leading-relaxed max-w-sm mx-auto">
                    Simulated payment processed successfully via Razorpay API!
                    Match request sent directly to Maya Sharma. Redirecting you
                    to chat...
                  </p>
                </div>

                <div className="flex gap-2 justify-center pt-2">
                  <button
                    onClick={() => {
                      const relevantTx = transactions.find(
                        (t) => t.listingId === selectedListing.id,
                      );
                      setSelectedListing(null);
                      if (relevantTx) {
                        setViewingChatTxId(relevantTx.id);
                        navigate("MESSAGES");
                      } else {
                        navigate("MESSAGES");
                      }
                    }}
                    className="px-6 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Open Active Chats Dashboard
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
