"use client";

import React from "react";
import {
  Ticket,
  Shield,
  Zap,
  Sparkles,
  MessageSquare,
  ArrowRight,
  HelpCircle,
} from "lucide-react";

interface LandingPageProps {
  onStartBrowsing: () => void;
  onPostListing: () => void;
  isDarkMode: boolean;
}

export default function LandingPage({
  onStartBrowsing,
  onPostListing,
  isDarkMode,
}: LandingPageProps) {
  return (
    <div
      className={`relative overflow-hidden py-6 md:py-12 transition-colors duration-200 ${isDarkMode ? "text-white" : "text-slate-800"}`}
    >
      {/* Decorative gradient blur background */}
      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl -z-10 transition-opacity ${isDarkMode ? "bg-gradient-to-tr from-pink-600/20 to-indigo-600/20 opacity-100" : "bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 opacity-70"}`}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Responsive Grid Layout - 2 Columns on Large Screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-16">
          {/* LEFT COLUMN: Hero content, Buttons, & Protection Modes (col-span-8) */}
          <div className="lg:col-span-8 space-y-12">
            {/* Hero Header Section */}
            <div className="text-left space-y-6">
              <div
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium font-display transition ${
                  isDarkMode
                    ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                    : "bg-pink-50 border-pink-200 text-pink-600"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                India's Smartest Movie Ticket Resale Hub
              </div>

              <h1
                className={`text-4xl md:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-none transition ${
                  isDarkMode
                    ? "text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-pink-300"
                    : "text-slate-900"
                }`}
              >
                Plans Changed?
                <br />
                <span className="text-pink-500 text-glow">
                  Swap Unused Tickets
                </span>{" "}
                Safely.
              </h1>

              <p
                className={`text-sm md:text-base leading-relaxed max-w-2xl transition ${
                  isDarkMode ? "text-gray-400" : "text-slate-600"
                }`}
              >
                Don't lose money on non-refundable tickets. Sell them below cost
                price in seconds, or grab discounted seats to sold-out
                blockbusters.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                <button
                  onClick={onStartBrowsing}
                  className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-900/40 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Browse Discounted Tickets
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onPostListing}
                  className={`w-full sm:w-auto px-6 py-3.5 border rounded-xl font-semibold transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-800/80 hover:bg-gray-700/85 border-gray-700 text-white"
                      : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
                  }`}
                >
                  Sell Your Extra Ticket
                  <Ticket className="w-4 h-4 text-pink-500" />
                </button>
              </div>
            </div>

            {/* Quick Introduction Card explaining what TicketSwap is */}
            <div
              className={`p-6 rounded-2xl border transition duration-200 ${
                isDarkMode
                  ? "bg-zinc-900/50 border-gray-850 text-white"
                  : "bg-white border-slate-200 text-slate-800 shadow-sm"
              }`}
            >
              <h3
                className={`text-base font-bold font-display flex items-center gap-2 mb-2.5 ${isDarkMode ? "text-white" : "text-slate-900"}`}
              >
                <Sparkles className="w-4.5 h-4.5 text-pink-500" />
                What is TicketSwap?
              </h3>
              <p
                className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-600"}`}
              >
                TicketSwap is India's dedicated peer-to-peer resale board for
                unused movie tickets. Movie tickets are typically
                non-refundable, meaning any sudden change of plans results in
                lost money. TicketSwap solves this by enabling film-goers to
                list theater seats securely for others to buy at a discounted
                price. Handed over physically at the cinema gate and secured by
                platform escrow and dual OTP checks, it's the safest way to get
                cheap seats or salvage your unused booking value.
              </p>
            </div>

            {/* Showcase Modes Section */}
            <div className="space-y-6 pt-4">
              <div>
                <h2
                  className={`text-xl sm:text-2xl font-bold font-display tracking-tight ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  Choose Your Transaction Comfort
                </h2>
                <p
                  className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                >
                  Two flexible matching methods configured for 100% mutual
                  safety.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {/* Mode 1 Card */}
                <div
                  className={`rounded-2xl p-6 relative overflow-hidden group border transition ${
                    isDarkMode
                      ? "glass-card border-gray-850"
                      : "bg-white border-slate-200 shadow-sm text-slate-800"
                  }`}
                >
                  <div
                    className={`absolute top-0 right-0 w-20 h-20 rounded-bl-full border-b border-l flex items-center justify-center font-bold font-display text-[10px] ${
                      isDarkMode
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : "bg-indigo-50 border-indigo-100 text-indigo-600"
                    }`}
                  >
                    ₹5 Fee
                  </div>
                  <div
                    className={`p-2.5 rounded-xl w-11 h-11 flex items-center justify-center mb-5 font-display border transition ${
                      isDarkMode
                        ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                        : "bg-indigo-50 border-indigo-150 text-indigo-600"
                    }`}
                  >
                    <Zap className="w-5 h-5" />
                  </div>
                  <h3
                    className={`text-lg font-bold font-display mb-1 transition ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Connect Mode
                  </h3>
                  <p
                    className={`text-xs leading-relaxed mb-5 transition ${
                      isDarkMode ? "text-gray-400" : "text-slate-600"
                    }`}
                  >
                    Best for quick, casual deals. Pay a small platform matching
                    fee of only ₹5 to unlock chat, match with the seller, and
                    arrange your own offline handover.
                  </p>
                  <ul
                    className={`space-y-2 border-t pt-4 text-[11px] transition ${
                      isDarkMode
                        ? "border-gray-850 text-gray-300"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                        }`}
                      />
                      <span>
                        Seller receives instant push match notification
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                        }`}
                      />
                      <span>
                        Sellers have 10 minutes to Accept or buyer is refunded
                        ₹5
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                        }`}
                      />
                      <span>
                        First message from seller locks transaction. UPI
                        directly
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Mode 2 Card */}
                <div
                  className={`rounded-2xl p-6 relative overflow-hidden group border transition duration-150 ${
                    isDarkMode
                      ? "glass-card border-pink-500/30"
                      : "bg-white border-2 border-pink-500/20 shadow-sm text-slate-800"
                  }`}
                >
                  <div className="absolute top-0 right-0 px-3 py-1 bg-pink-600 rounded-bl-xl text-[9px] font-bold font-display tracking-wider text-white">
                    SECURE ESCROW
                  </div>
                  <div
                    className={`p-2.5 rounded-xl w-11 h-11 flex items-center justify-center mb-5 font-display border transition ${
                      isDarkMode
                        ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                        : "bg-pink-50 border-pink-150 text-pink-600"
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                  </div>
                  <h3
                    className={`text-lg font-bold font-display mb-1 flex items-center gap-2 transition ${
                      isDarkMode ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Safe Mode
                  </h3>
                  <p
                    className={`text-xs leading-relaxed mb-5 transition ${
                      isDarkMode ? "text-gray-400" : "text-slate-600"
                    }`}
                  >
                    100% guarantee. Buyer pays into a secure escrow. Funds are
                    held safely by the platform until you meet at the cinema
                    gate, verify the ticket, and swap OTPs.
                  </p>
                  <ul
                    className={`space-y-2 border-t pt-4 text-[11px] transition ${
                      isDarkMode
                        ? "border-gray-850 text-gray-300"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-pink-400" : "bg-pink-600"
                        }`}
                      />
                      <span>
                        Full ticket amount + platfee held safely in escrow
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-pink-400" : "bg-pink-600"
                        }`}
                      />
                      <span>
                        Physical meeting checked via secure dual OTP exchange
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span
                        className={`w-1 h-1 rounded-full mt-1.5 shrink-0 ${
                          isDarkMode ? "bg-pink-400" : "bg-pink-600"
                        }`}
                      />
                      <span>
                        Dispute coverage up to 60 minutes after showtime starts
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: How It Works stepper panel (col-span-4) */}
          <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 lg:mt-6">
            <div
              className={`rounded-2xl p-6 border transition-all duration-200 ${
                isDarkMode
                  ? "bg-gray-900/35 border-gray-850 text-white"
                  : "bg-white border-slate-200 text-slate-800 shadow-sm"
              }`}
            >
              <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-800/10 dark:border-gray-800/60">
                <HelpCircle className="w-5 h-5 text-pink-500 shrink-0" />
                <h3
                  className={`text-base font-bold font-display ${isDarkMode ? "text-white" : "text-slate-900"}`}
                >
                  How TicketSwap Works
                </h3>
              </div>

              <div className="space-y-6">
                {/* Step 1 */}
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider font-mono mb-1 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                    >
                      List Unused Tickets
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Plans changed? Upload your cinema booking screenshot, set
                      cinema hall details, seats, and specify your resale
                      discount price.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider font-mono mb-1 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                    >
                      Select Protection Mode
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Buyers choose **Connect Mode** (₹5 quick chat access
                      match) or **Safe Mode** (100% TicketSwap secure escrow
                      protection).
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider font-mono mb-1 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                    >
                      Unlock Chat & Match
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Once matched, safe messaging unlocks instantly. Coordinate
                      the swap details directly and securely on our encrypted
                      chats.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider font-mono mb-1 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                    >
                      Meet & Dual OTP Swap
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Meet physically at the cinema entrance. Inspect the seat
                      ticket barcode, exchange secure OTPs, and release the
                      funds!
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div className="flex gap-3.5">
                  <div className="w-6 h-6 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider font-mono mb-1 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                    >
                      60m Dispute Cover
                    </h4>
                    <p
                      className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
                    >
                      Step in securely. If the gate rejects the seat or it was
                      double-booked, raise a dispute within 60m of showtime for
                      full refund.
                    </p>
                  </div>
                </div>
              </div>

              <div
                className={`mt-6 pt-5 border-t border-dashed text-[11px] text-center ${
                  isDarkMode
                    ? "border-gray-800 text-zinc-500"
                    : "border-slate-200 text-slate-450"
                }`}
              >
                🍿 Swapped over{" "}
                <b className={isDarkMode ? "text-pink-400" : "text-pink-600"}>
                  12,500+ cinema seats
                </b>{" "}
                across India this month!
              </div>
            </div>
          </aside>
        </div>

        {/* BOTTOM ROW: Trust Badges */}
        <div className="max-w-7xl mx-auto text-center">
          <p
            className={`text-[10px] uppercase font-mono tracking-widest mb-6 transition ${
              isDarkMode ? "text-gray-500" : "text-slate-400"
            }`}
          >
            TicketSwap Safety Safeguards
          </p>
          <div
            className={`grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl border transition ${
              isDarkMode
                ? "bg-gray-900/30 border-gray-850"
                : "bg-white border-slate-200 shadow-sm"
            }`}
          >
            <div className="flex flex-col items-center">
              <div
                className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
              >
                ₹5 Match Fee
              </div>
              <p
                className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Economical direct connection deals
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
              >
                OTP Swapping
              </div>
              <p
                className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Physically verified handovers
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
              >
                60m Protection
              </div>
              <p
                className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Escrow refunds for invalid seats
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div
                className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
              >
                Secure Chats
              </div>
              <p
                className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
              >
                Protected context communications
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
