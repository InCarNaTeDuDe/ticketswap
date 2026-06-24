import React from "react";
import {
  User,
  Mail,
  Shield,
  Wallet as WalletIcon,
  ListCollapse,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  Clock,
  Ticket,
  AlertCircle,
} from "lucide-react";
import { Persona, Wallet, Listing, Transaction } from "../types";

interface ProfileTabProps {
  activePersona: Persona;
  wallet: Wallet | null;
  listings: Listing[];
  transactions: Transaction[];
  isDarkMode: boolean;
  onNavigate: (
    tab:
      | "HOME"
      | "BROWSE"
      | "POST"
      | "MESSAGES"
      | "WALLET"
      | "ADMIN"
      | "PROFILE",
  ) => void;
}

export default function ProfileTab({
  activePersona,
  wallet,
  listings,
  transactions,
  isDarkMode,
  onNavigate,
}: ProfileTabProps) {
  // Filter listings created by the user
  const userListings = listings.filter((l) => l.sellerId === activePersona.id);

  // Filter transactions involved in
  const userTransactions = transactions.filter(
    (tx) => tx.buyerId === activePersona.id || tx.sellerId === activePersona.id,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h2
          className={`text-3xl font-extrabold font-display mb-2 flex items-center gap-2 ${
            isDarkMode ? "text-white" : "text-slate-900"
          }`}
        >
          <User className="w-8 h-8 text-pink-500" />
          My Profile Dashboard
        </h2>
        <p
          className={`text-xs ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
        >
          Manage your account credentials, review your listings, track cash
          reserves, and inspect swap logs.
        </p>
      </div>

      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Column: User Profile Card */}
        <div className="md:col-span-5 space-y-6">
          <div
            className={`rounded-2xl p-6 border transition-all duration-200 relative overflow-hidden ${
              isDarkMode
                ? "bg-gradient-to-tr from-gray-950 via-gray-900 to-indigo-950/30 border-gray-850 text-white"
                : "bg-white border-slate-200 text-slate-800 shadow-sm"
            }`}
          >
            {/* Decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col items-center text-center">
              {/* Profile Avatar */}
              <div className="relative group mb-4">
                <div className="absolute inset-0 bg-gradient-to-tr from-pink-500 to-indigo-500 rounded-full blur-sm opacity-60 group-hover:opacity-90 transition-opacity duration-200" />
                <img
                  src={
                    activePersona.avatar ||
                    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80"
                  }
                  alt={activePersona.name}
                  className="w-24 h-24 rounded-full border-2 border-white object-cover relative z-10"
                />
              </div>

              {/* User Name */}
              <h3
                className={`text-xl font-bold font-display ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                {activePersona.name}
              </h3>

              {/* Role Badge */}
              <span
                className={`mt-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border flex items-center gap-1.5 ${
                  activePersona.role === "admin"
                    ? "bg-red-500/10 border-red-500/30 text-red-400"
                    : activePersona.role === "seller"
                      ? "bg-pink-500/10 border-pink-500/25 text-pink-400"
                      : "bg-indigo-500/10 border-indigo-500/25 text-indigo-400"
                }`}
              >
                <Shield className="w-3 h-3" />
                ROLE: {activePersona.role}
              </span>

              {/* Detailed Data list */}
              <div
                className={`w-full mt-6 space-y-3.5 pt-6 border-t text-xs font-mono ${
                  isDarkMode ? "border-gray-850" : "border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                  >
                    USER ID:
                  </span>
                  <span
                    className={`font-semibold ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}
                  >
                    {activePersona.id}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                  >
                    EMAIL:
                  </span>
                  <span
                    className={`font-semibold truncate max-w-[180px] ${isDarkMode ? "text-gray-300" : "text-slate-700"}`}
                  >
                    {activePersona.email}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`${isDarkMode ? "text-gray-500" : "text-slate-400"}`}
                  >
                    WALLET BAL:
                  </span>
                  <span className="font-extrabold text-pink-500">
                    ₹{wallet?.balance ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics grid */}
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => onNavigate("WALLET")}
              className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${
                isDarkMode
                  ? "bg-gray-900/40 border-gray-850 hover:bg-gray-900/60"
                  : "bg-white border-slate-200 shadow-sm hover:shadow"
              }`}
            >
              <div className="flex items-center gap-2 text-pink-500">
                <WalletIcon className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  WALLET
                </span>
              </div>
              <p
                className={`text-base font-extrabold mt-1.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}
              >
                ₹{wallet?.balance ?? 0}
              </p>
              <p
                className={`text-[9px] mt-0.5 ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}
              >
                Manage Cash Reserves
              </p>
            </div>

            <div
              onClick={() => onNavigate("MESSAGES")}
              className={`p-4 rounded-xl border cursor-pointer hover:scale-[1.02] transition-transform ${
                isDarkMode
                  ? "bg-gray-900/40 border-gray-850 hover:bg-gray-900/60"
                  : "bg-white border-slate-200 shadow-sm hover:shadow"
              }`}
            >
              <div className="flex items-center gap-2 text-indigo-500">
                <MessageSquare className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase font-bold tracking-wider">
                  SWAP MATCHES
                </span>
              </div>
              <p
                className={`text-base font-extrabold mt-1.5 ${isDarkMode ? "text-white" : "text-slate-800"}`}
              >
                {userTransactions.length} Active
              </p>
              <p
                className={`text-[9px] mt-0.5 ${isDarkMode ? "text-gray-500" : "text-slate-450"}`}
              >
                Open Swaps Portal
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Listings and History details */}
        <div className="md:col-span-7 space-y-6">
          {/* User's Posted Listings section */}
          <div
            className={`rounded-2xl p-6 border ${
              isDarkMode
                ? "bg-gray-900/40 border-gray-850"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h4
                className={`text-sm font-bold font-display flex items-center gap-1.5 ${
                  isDarkMode ? "text-white" : "text-slate-800"
                }`}
              >
                <ListCollapse className="w-4 h-4 text-pink-500" />
                My Posted Ticket Resales ({userListings.length})
              </h4>

              {activePersona.role !== "admin" && (
                <button
                  onClick={() => onNavigate("POST")}
                  className="text-pink-500 hover:text-pink-600 text-xs font-bold font-display flex items-center gap-0.5 transition cursor-pointer"
                >
                  Post New
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {userListings.length === 0 ? (
              <div
                className={`text-center py-8 rounded-xl border border-dashed ${
                  isDarkMode
                    ? "border-gray-800 text-gray-500"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                <Ticket className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  You haven't listed any tickets for sale yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {userListings.map((listing) => (
                  <div
                    key={listing.id}
                    className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                      isDarkMode
                        ? "bg-gray-950/50 border-gray-850/60"
                        : "bg-slate-50 border-slate-100"
                    }`}
                  >
                    <div className="truncate min-w-0">
                      <h5
                        className={`text-xs font-bold truncate capitalize ${isDarkMode ? "text-white" : "text-slate-800"}`}
                      >
                        {listing.movieName}
                      </h5>
                      <p
                        className={`text-[10px] truncate ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                      >
                        📍 {listing.theatreName} • Seat: {listing.seatNumber}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] font-mono text-pink-500 font-extrabold">
                          ₹{listing.sellingPrice}
                        </p>
                        <p
                          className={`text-[8px] font-mono line-through ${isDarkMode ? "text-gray-600" : "text-slate-400"}`}
                        >
                          ₹{listing.originalPrice}
                        </p>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                          listing.status === "AVAILABLE"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : listing.status === "COMPLETED"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                        }`}
                      >
                        {listing.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User's Swap Transactions History */}
          <div
            className={`rounded-2xl p-6 border ${
              isDarkMode
                ? "bg-gray-900/40 border-gray-850"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <h4
              className={`text-sm font-bold font-display mb-4 flex items-center gap-1.5 ${
                isDarkMode ? "text-white" : "text-slate-800"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              My Active & Historical Swaps ({userTransactions.length})
            </h4>

            {userTransactions.length === 0 ? (
              <div
                className={`text-center py-8 rounded-xl border border-dashed ${
                  isDarkMode
                    ? "border-gray-800 text-gray-500"
                    : "border-slate-200 text-slate-400"
                }`}
              >
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">
                  No active or historical matches initiated yet.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {userTransactions
                  .slice()
                  .reverse()
                  .map((tx) => {
                    const isBuyerMe = tx.buyerId === activePersona.id;
                    const partnerName = isBuyerMe
                      ? tx.sellerName
                      : tx.buyerName;
                    const dateStr = new Date(tx.createdAt).toLocaleDateString(
                      undefined,
                      {
                        month: "short",
                        day: "numeric",
                      },
                    );

                    return (
                      <div
                        key={tx.id}
                        onClick={() => onNavigate("MESSAGES")}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition hover:scale-[1.01] ${
                          isDarkMode
                            ? "bg-gray-950/50 border-gray-850/60 hover:bg-gray-950"
                            : "bg-slate-50 border-slate-100 hover:bg-slate-100"
                        }`}
                      >
                        <div className="truncate min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5
                              className={`text-xs font-bold truncate ${isDarkMode ? "text-white" : "text-slate-800"}`}
                            >
                              Swap with {partnerName}
                            </h5>
                            <span
                              className={`px-1.5 py-0.2 rounded font-mono text-[7px] font-bold ${
                                tx.mode === "SAFE"
                                  ? "bg-pink-500/10 text-pink-400"
                                  : "bg-indigo-500/10 text-indigo-400"
                              }`}
                            >
                              {tx.mode}
                            </span>
                          </div>
                          <p
                            className={`text-[10px] mt-0.5 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                          >
                            Role:{" "}
                            <b className="capitalize">
                              {isBuyerMe ? "Buyer" : "Seller"}
                            </b>{" "}
                            • {dateStr}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="text-right">
                            <p
                              className={`text-[10px] font-mono font-extrabold ${isDarkMode ? "text-gray-200" : "text-slate-700"}`}
                            >
                              ₹{tx.amountPaid}
                            </p>
                            <p
                              className={`text-[8px] font-mono text-gray-500 uppercase`}
                            >
                              {tx.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
