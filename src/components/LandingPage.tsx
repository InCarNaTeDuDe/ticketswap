import React from 'react';
import { Ticket, Shield, Zap, Sparkles, MessageSquare, ArrowRight, HelpCircle } from 'lucide-react';

interface LandingPageProps {
  onStartBrowsing: () => void;
  onPostListing: () => void;
}

export default function LandingPage({ onStartBrowsing, onPostListing }: LandingPageProps) {
  return (
    <div className="relative overflow-hidden py-10 md:py-20 text-white">
      {/* Decorative gradient blur background */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-pink-600/20 to-indigo-600/20 rounded-full blur-3xl -z-10" />

      {/* Hero Header */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs text-pink-400 font-medium mb-6 font-display">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          India's Smartest Movie Ticket Resale Hub
        </div>
        
        <h1 className="text-4xl md:text-6xl font-extrabold font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-100 to-pink-300 leading-tight mb-6">
          Plans Changed?<br />
          <span className="text-pink-500 text-glow">Swap Unused Tickets</span> Safely.
        </h1>
        
        <p className="text-base md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
          Don't lose money on non-refundable tickets. Sell them below cost price in seconds, or grab discounted seats to sold-out blockbusters.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={onStartBrowsing}
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl font-semibold hover:from-pink-500 hover:to-rose-500 shadow-lg shadow-pink-900/40 transition duration-150 flex items-center justify-center gap-2 group cursor-pointer"
          >
            Browse Discounted Tickets
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={onPostListing}
            className="w-full sm:w-auto px-8 py-4 bg-gray-800/80 hover:bg-gray-700/85 border border-gray-700 rounded-xl font-semibold transition duration-150 flex items-center justify-center gap-2 cursor-pointer"
          >
            Sell Your Extra Ticket
            <Ticket className="w-4 h-4 text-pink-400" />
          </button>
        </div>
      </div>

      {/* Showcase Grid of Modes */}
      <div id="modes-grid" className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-8 text-left mb-16">
        
        {/* Mode 1 Card */}
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full border-b border-l border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold font-display">
            ₹5 Fee
          </div>
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl w-14 h-14 flex items-center justify-center text-indigo-400 mb-6 font-display">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white mb-2">
            Connect Mode
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Best for quick, casual deals. Pay a small platform matching fee of only ₹5 to unlock chat, match with the seller, and arrange your own offline handover.
          </p>
          <ul className="space-y-3 border-t border-gray-800 pt-5 text-gray-300 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
              <span>Seller receives instand push match notification</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
              <span>Sellers have 10 minutes to Accept (or buyer gets refunded ₹5)</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 shrink-0" />
              <span>First message from seller locks transaction. Exchange numbers or UPI directly</span>
            </li>
          </ul>
        </div>

        {/* Mode 2 Card */}
        <div className="glass-card rounded-2xl p-8 relative overflow-hidden border-pink-500/30 group">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-pink-600 rounded-bl-xl text-xs font-bold font-display tracking-widest text-shadow">
            SECURE ESCROW
          </div>
          <div className="p-3 bg-pink-500/10 border border-pink-500/20 rounded-xl w-14 h-14 flex items-center justify-center text-pink-400 mb-6 font-display">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-bold font-display text-white mb-2 flex items-center gap-2">
            Safe Mode
          </h3>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            100% guarantee. Buyer pays into a secure escrow. Funds are held safely by the platform until you meet at the cinema gate, verify the ticket, and swap OTPs.
          </p>
          <ul className="space-y-3 border-t border-gray-800 pt-5 text-gray-300 text-xs">
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
              <span>Full ticket amount + platfee safely held in escrow</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
              <span>Physical meeting check via secure dual OTP exchange</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full mt-1.5 shrink-0" />
              <span>Dispute coverage up to 60 minutes after showtime starts</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Trust Badges */}
      <div className="max-w-5xl mx-auto px-4 text-center">
        <p className="text-gray-500 text-xs uppercase font-mono tracking-widest mb-6">TicketSwap Safety Safeguards</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 bg-gray-900/40 border border-gray-800/60 p-6 rounded-xl">
          <div className="flex flex-col items-center">
            <div className="text-pink-400 font-bold font-display text-lg">₹5 Platfee</div>
            <p className="text-gray-400 text-[11px] mt-1">Super economical connections</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-pink-400 font-bold font-display text-lg">OTP Swapping</div>
            <p className="text-gray-400 text-[11px] mt-1">Physically verified presence</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-pink-400 font-bold font-display text-lg">60m Dispute Window</div>
            <p className="text-gray-400 text-[11px] mt-1">Protection post-screening start</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-pink-400 font-bold font-display text-lg">Interactive chat</div>
            <p className="text-gray-400 text-[11px] mt-1">Seamless secure negotiation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
