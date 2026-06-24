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
      className={`relative overflow-hidden py-10 md:py-20 transition-colors duration-200 ${isDarkMode ? "text-white" : "text-slate-800"}`}
    >
      {/* Decorative gradient blur background */}
      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full blur-3xl -z-10 transition-opacity ${isDarkMode ? "bg-gradient-to-tr from-pink-600/20 to-indigo-600/20 opacity-100" : "bg-gradient-to-tr from-pink-500/10 to-indigo-500/10 opacity-70"}`}
      />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-14">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium mb-6 font-display transition ${
            isDarkMode
              ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
              : "bg-pink-50 border-pink-200 text-pink-600"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          India's Smartest Movie Ticket Resale Hub
        </div>

        <h1
          className={`text-4xl md:text-6xl font-extrabold font-display tracking-tight leading-tight mb-6 transition ${
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
          className={`text-base md:text-xl max-w-2xl mx-auto leading-relaxed mb-8 transition ${
            isDarkMode ? "text-gray-400" : "text-slate-600"
          }`}
        >
          Don't lose money on non-refundable tickets. Sell them below cost price
          in seconds, or grab discounted seats to sold-out blockbusters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartBrowsing}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-900/40 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
          >
            Browse Discounted Tickets
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onPostListing}
            className={`w-full sm:w-auto px-8 py-4 border rounded-xl font-semibold transition duration-150 flex items-center justify-center gap-2 cursor-pointer ${
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

      {/* Showcase Grid of Modes */}
      <div
        id="modes-grid"
        className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 text-left mb-16"
      >
        {/* Mode 1 Card */}
        <div
          className={`rounded-2xl p-8 relative overflow-hidden group border transition ${
            isDarkMode
              ? "glass-card border-gray-800"
              : "bg-white border-slate-100 shadow-md shadow-slate-100/50 text-slate-800"
          }`}
        >
          <div
            className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full border-b border-l flex items-center justify-center font-bold font-display text-xs ${
              isDarkMode
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                : "bg-indigo-50/50 border-indigo-100 text-indigo-600"
            }`}
          >
            ₹5 Fee
          </div>
          <div
            className={`p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6 font-display border transition ${
              isDarkMode
                ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
                : "bg-indigo-50 border-indigo-150 text-indigo-600"
            }`}
          >
            <Zap className="w-7 h-7" />
          </div>
          <h3
            className={`text-2xl font-bold font-display mb-2 transition ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Connect Mode
          </h3>
          <p
            className={`text-sm leading-relaxed mb-6 transition ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            Best for quick, casual deals. Pay a small platform matching fee of
            only ₹5 to unlock chat, match with the seller, and arrange your own
            offline handover.
          </p>
          <ul
            className={`space-y-3 border-t pt-5 text-xs transition ${
              isDarkMode
                ? "border-gray-800 text-gray-300"
                : "border-slate-100 text-slate-700"
            }`}
          >
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                }`}
              />
              <span>Seller receives instant push match notification</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                }`}
              />
              <span>
                Sellers have 10 minutes to Accept (or buyer gets refunded ₹5)
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDarkMode ? "bg-indigo-400" : "bg-indigo-600"
                }`}
              />
              <span>
                First message from seller locks transaction. Exchange numbers or
                UPI directly
              </span>
            </li>
          </ul>
        </div>

        {/* Mode 2 Card */}
        <div
          className={`rounded-2xl p-8 relative overflow-hidden group border transition duration-150 ${
            isDarkMode
              ? "glass-card border-pink-500/30"
              : "bg-white border-2 border-pink-500/30 shadow-lg shadow-pink-50/50 text-slate-800"
          }`}
        >
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-pink-600 rounded-bl-xl text-[10px] font-bold font-display tracking-widest text-white">
            SECURE ESCROW
          </div>
          <div
            className={`p-3 rounded-xl w-14 h-14 flex items-center justify-center mb-6 font-display border transition ${
              isDarkMode
                ? "bg-pink-500/10 border-pink-500/20 text-pink-400"
                : "bg-pink-50 border-pink-150 text-pink-600"
            }`}
          >
            <Shield className="w-7 h-7" />
          </div>
          <h3
            className={`text-2xl font-bold font-display mb-2 flex items-center gap-2 transition ${
              isDarkMode ? "text-white" : "text-slate-900"
            }`}
          >
            Safe Mode
          </h3>
          <p
            className={`text-sm leading-relaxed mb-6 transition ${
              isDarkMode ? "text-gray-400" : "text-slate-600"
            }`}
          >
            100% guarantee. Buyer pays into a secure escrow. Funds are held
            safely by the platform until you meet at the cinema gate, verify the
            ticket, and swap OTPs.
          </p>
          <ul
            className={`space-y-3 border-t pt-5 text-xs transition ${
              isDarkMode
                ? "border-gray-800 text-gray-300"
                : "border-slate-100 text-slate-700"
            }`}
          >
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDarkMode ? "bg-pink-400" : "bg-pink-600"
                }`}
              />
              <span>Full ticket amount + platfee safely held in escrow</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                  isDarkMode ? "bg-pink-400" : "bg-pink-600"
                }`}
              />
              <span>Physical meeting check via secure dual OTP exchange</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span
                className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
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

      {/* Trust Badges */}
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p
          className={`text-[10px] uppercase font-mono tracking-widest mb-6 transition ${
            isDarkMode ? "text-gray-500" : "text-slate-400"
          }`}
        >
          TicketSwap Safety Safeguards
        </p>
        <div
          className={`grid grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-xl border transition ${
            isDarkMode
              ? "bg-gray-900/40 border-gray-800/60"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex flex-col items-center">
            <div
              className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
            >
              ₹5 Platfee
            </div>
            <p
              className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Super economical connections
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
              Physically verified presence
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
            >
              60m Dispute
            </div>
            <p
              className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Protection post-screening
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`font-bold font-display text-lg ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
            >
              Secure Chat
            </div>
            <p
              className={`text-[11px] mt-1 ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Seamless negotiation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
