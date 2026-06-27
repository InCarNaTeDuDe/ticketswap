import React, { useState } from 'react';
import { Upload, Film, MapPin, Calendar, CreditCard, Sparkles, AlertCircle } from 'lucide-react';

interface ListingFormProps {
  onSubmit: (listingData: {
    movieName: string;
    theatreName: string;
    showTime: string;
    seatNumber: string;
    originalPrice: number;
    sellingPrice: number;
    screenshotUrl: string;
    description: string;
    category: 'TicketSwap' | 'DayMates';
    isTicketSwap: boolean;
    isDayMates: boolean;
  }) => void;
  onCancel: () => void;
  sellerName: string;
  isDarkMode: boolean;
}

const POSTER_PRESETS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80", // cinema halls
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&q=80", // red curtains
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80", // blue seats
  "https://images.unsplash.com/photo-1478720143033-6a972678aa30?w=500&q=80"  // projector
];

export default function ListingForm({ onSubmit, onCancel, sellerName, isDarkMode }: ListingFormProps) {
  const [isTicketSwap, setIsTicketSwap] = useState(true);
  const [isDayMates, setIsDayMates] = useState(false);
  const [movieName, setMovieName] = useState("");
  const [theatreName, setTheatreName] = useState("");
  const [showTime, setShowTime] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [originalPrice, setOriginalPrice] = useState<number>(300);
  const [sellingPrice, setSellingPrice] = useState<number>(200);
  const [screenshotUrl, setScreenshotUrl] = useState(POSTER_PRESETS[0]);
  const [description, setDescription] = useState("");
  const [imageTab, setImageTab] = useState<'presets' | 'custom'>('presets');
  const [customUrl, setCustomUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const savings = originalPrice - sellingPrice;
  const savingsPct = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTicketSwap && !isDayMates) {
      setErrorMsg("Please select at least one listing type: TicketSwap or DayMates!");
      return;
    }

    if (!movieName || !theatreName || !showTime || !seatNumber || originalPrice <= 0 || sellingPrice < 0) {
      setErrorMsg("Please fill in all required fields and verify pricing.");
      return;
    }

    if (isTicketSwap && sellingPrice >= originalPrice) {
      setErrorMsg("TicketSwap resale price must be less than original price so buyers can see real savings!");
      return;
    }

    if (!isTicketSwap && isDayMates && sellingPrice > originalPrice) {
      setErrorMsg("Companion contribution price cannot exceed the original ticket price!");
      return;
    }

    onSubmit({
      movieName,
      theatreName,
      showTime,
      seatNumber,
      originalPrice,
      sellingPrice,
      screenshotUrl: imageTab === 'custom' && customUrl ? customUrl : screenshotUrl,
      description,
      category: isTicketSwap ? 'TicketSwap' : 'DayMates',
      isTicketSwap,
      isDayMates
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Inputs Panel */}
        <div className={`lg:col-span-7 rounded-2xl p-6 md:p-8 border transition-all duration-200 ${
          isDarkMode ? 'bg-gray-900/60 border-gray-850' : 'bg-white border-slate-200 shadow-sm text-slate-800'
        }`}>
          <div className="mb-6">
            <h2 className={`text-2xl font-bold font-display flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              <Film className="w-6 h-6 text-pink-500" />
              Create Movie Ticket Listing
            </h2>
            <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
              Publish your ticket and receive cash instantly once swapped.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Category Selector */}
            <div className="space-y-2">
              <label className={`block text-xs font-semibold uppercase tracking-wider font-mono ${isDarkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                Select Listing Type / Categories (Select one or both!)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsTicketSwap(!isTicketSwap);
                    setErrorMsg("");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition duration-150 flex flex-col justify-between cursor-pointer ${
                    isTicketSwap
                      ? 'border-pink-500 bg-pink-500/5 text-white'
                      : (isDarkMode ? 'border-gray-800 bg-gray-950/40 text-gray-400 hover:border-gray-700' : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300')
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Film className={`w-4 h-4 ${isTicketSwap ? 'text-pink-500' : 'text-gray-400'}`} />
                      <span className="font-bold text-xs font-display">TicketSwap</span>
                    </div>
                    {isTicketSwap && (
                      <span className="text-[9px] bg-pink-500 text-white font-mono px-1.5 py-0.5 rounded-md uppercase font-bold">Active</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                    Sell unused movie tickets safely below cost price.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDayMates(!isDayMates);
                    setErrorMsg("");
                  }}
                  className={`p-3.5 rounded-xl border text-left transition duration-150 flex flex-col justify-between cursor-pointer ${
                    isDayMates
                      ? 'border-pink-500 bg-pink-500/5 text-white'
                      : (isDarkMode ? 'border-gray-800 bg-gray-950/40 text-gray-400 hover:border-gray-700' : 'border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300')
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Upload className={`w-4 h-4 ${isDayMates ? 'text-pink-500' : 'text-gray-400'}`} />
                      <span className="font-bold text-xs font-display">DayMates</span>
                    </div>
                    {isDayMates && (
                      <span className="text-[9px] bg-pink-500 text-white font-mono px-1.5 py-0.5 rounded-md uppercase font-bold">Active</span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1.5 leading-snug">
                    Find a movie buddy to share tickets or watch together.
                  </p>
                </button>
              </div>
              
              {isTicketSwap && isDayMates && (
                <div className="p-2.5 bg-pink-500/10 border border-pink-500/20 text-pink-400 text-[10px] rounded-xl font-mono leading-normal">
                  🚀 <b>Dual Listing Active:</b> You are selling the extra ticket at a discount AND inviting them to watch the movie with you! Excellent choice.
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Movie Title */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Movie Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pushpa 2: The Rule, Avengers: Doomsday"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                  isDarkMode 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                }`}
                value={movieName}
                onChange={(e) => {
                  setMovieName(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>

            {/* Theatre location */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Theatre & City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PVR Forum Mall, Bengaluru"
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                  isDarkMode 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                }`}
                value={theatreName}
                onChange={(e) => {
                  setTheatreName(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>

            {/* Showtime & Seat in two columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Show Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className={`w-full px-3 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                    isDarkMode 
                      ? 'bg-gray-950 border-gray-800 text-white text-scheme-dark' 
                      : 'bg-white border-slate-200 text-slate-800 shadow-sm text-scheme-light'
                  }`}
                  value={showTime}
                  onChange={(e) => {
                    setShowTime(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                  isDarkMode ? 'text-gray-300' : 'text-slate-600'
                }`}>
                  Seat Number / Row *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Row K - Seat 13, 14"
                  className={`w-full px-3 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                    isDarkMode 
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                  }`}
                  value={seatNumber}
                  onChange={(e) => {
                    setSeatNumber(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>
            </div>

            {/* Original vs Selling Prices */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border transition ${
              isDarkMode 
                ? 'bg-gray-950/40 border-gray-800/40' 
                : 'bg-slate-50 border-slate-100 shadow-sm'
            }`}>
              <div>
                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  className={`w-full px-3 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                    isDarkMode 
                      ? 'bg-gray-950 border-gray-800 text-white' 
                      : 'bg-white border-slate-200 text-slate-850 shadow-sm'
                  }`}
                  value={originalPrice}
                  onChange={(e) => {
                    setOriginalPrice(Math.max(0, Number(e.target.value)));
                    setErrorMsg("");
                  }}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1 ${
                  isDarkMode ? 'text-pink-400' : 'text-pink-600'
                }`}>
                  {isTicketSwap && isDayMates 
                    ? 'Resale Price / Split Share (₹) *' 
                    : isTicketSwap 
                      ? 'Selling Price (₹) *' 
                      : 'Companion Contribution / Split Share (₹) *'}
                  <Sparkles className={`w-3.5 h-3.5 ${isDarkMode ? 'text-pink-400' : 'text-pink-500'}`} />
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className={`w-full px-3 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                    isDarkMode 
                      ? 'bg-gray-950 border-gray-800 text-white' 
                      : 'bg-white border-slate-200 text-slate-850 shadow-sm'
                  }`}
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPrice(Math.max(0, Number(e.target.value)));
                    setErrorMsg("");
                  }}
                />
                {isDayMates && (
                  <p className="text-[10px] mt-1.5 text-pink-500 font-mono">
                    💡 Set to 0 if companion ticket is sponsored/free, or set a split amount.
                  </p>
                )}
              </div>
            </div>

            {/* Graphic Selection */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                Booking Reference Screenshot / Graphic
              </label>
              
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageTab('presets')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition ${
                    imageTab === 'presets' 
                      ? 'bg-pink-600 text-white font-semibold' 
                      : (isDarkMode ? 'bg-zinc-800 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                  }`}
                >
                  Gallery Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('custom')}
                  className={`px-3 py-1 text-xs font-mono rounded cursor-pointer transition ${
                    imageTab === 'custom' 
                      ? 'bg-pink-600 text-white font-semibold' 
                      : (isDarkMode ? 'bg-zinc-800 text-gray-400 hover:text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                  }`}
                >
                  Custom URL / Base64
                </button>
              </div>

              {imageTab === 'presets' ? (
                <div className="grid grid-cols-4 gap-2">
                  {POSTER_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setScreenshotUrl(preset)}
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 cursor-pointer transition ${
                        screenshotUrl === preset ? 'border-pink-500 scale-[1.03]' : 'border-transparent opacity-80 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} className="w-full h-full object-cover" alt={`Preset ${idx}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Paste image web address URL or Base64 string..."
                  className={`w-full px-4 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none transition ${
                    isDarkMode 
                      ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' 
                      : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                  }`}
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              )}
            </div>

            {/* Description Notes */}
            <div>
              <label className={`block text-xs font-medium mb-1.5 uppercase tracking-wider font-mono ${
                isDarkMode ? 'text-gray-300' : 'text-slate-600'
              }`}>
                {isTicketSwap && isDayMates 
                  ? 'Meet Guidelines, Companion Preferences & Resell Details' 
                  : isTicketSwap 
                    ? 'Extra Note / Reason for reselling' 
                    : 'Companion Details & Meet Guidelines'}
              </label>
              <textarea
                placeholder={isTicketSwap && isDayMates
                  ? "Explain why you are selling, details of seat viewing perks, who you would like to watch with, and guidelines on where to meet up at the theater..."
                  : isTicketSwap 
                    ? "Suggest why you are selling, details of ticket collector codes, cinema seating view perks, or meet guidelines..."
                    : "Explain why you are looking for a companion, what kind of movie buddy you'd like to watch with, guidelines on where to meet up at the theater, etc."
                }
                className={`w-full px-4 py-3 border rounded-xl text-sm focus:border-pink-500 focus:outline-none h-24 resize-none transition ${
                  isDarkMode 
                    ? 'bg-gray-950 border-gray-800 text-white placeholder-gray-600' 
                    : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 shadow-sm'
                }`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Cancel Controls */}
            <div className={`flex items-center gap-3 pt-4 border-t ${isDarkMode ? 'border-gray-850' : 'border-slate-100'}`}>
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition cursor-pointer text-center text-xs uppercase tracking-wider font-display"
              >
                {isTicketSwap && isDayMates 
                  ? 'Post Dual Listing (Free)' 
                  : isTicketSwap 
                    ? 'Post Resale (Free)' 
                    : 'Post Companion Search (Free)'}
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className={`px-5 py-3 rounded-xl font-semibold transition cursor-pointer text-xs uppercase tracking-wider font-display ${
                  isDarkMode 
                    ? 'bg-gray-800 hover:bg-gray-750 text-gray-300' 
                    : 'bg-slate-150 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Live SVG Ticket Preview Sticky */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6 space-y-6">
            <h3 className={`text-xs uppercase font-mono tracking-widest font-bold mb-1 ${
              isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
            }`}>
              Live Digital Ticket Preview
            </h3>

            {/* Stylized Ticket Stub Container */}
            <div className={`relative rounded-2xl overflow-hidden p-5 border-l-4 border-l-pink-500 border transition ${
              isDarkMode 
                ? 'glass-card border-gray-850 text-white' 
                : 'bg-white border-slate-200 shadow-md shadow-slate-100/60 text-slate-800'
            }`}>
              {/* Circles on border for ticket look */}
              <div className={`absolute top-1/2 -translate-y-1/2 -left-[14px] w-7 h-7 border rounded-full z-10 transition ${
                isDarkMode ? 'bg-gray-950 border-gray-850' : 'bg-slate-50 border-slate-200'
              }`} />
              <div className={`absolute top-1/2 -translate-y-1/2 -right-[14px] w-7 h-7 border rounded-full z-10 transition ${
                isDarkMode ? 'bg-gray-950 border-gray-850' : 'bg-slate-50 border-slate-200'
              }`} />

              {/* Upper Section */}
              <div className={`pb-4 border-b border-dashed ${isDarkMode ? 'border-gray-850' : 'border-slate-100'}`}>
                <div className="flex justify-between items-start gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                    isDarkMode 
                      ? 'bg-pink-500/10 border-pink-500/25 text-pink-400' 
                      : 'bg-pink-50 border-pink-100 text-pink-600'
                  }`}>
                    {isTicketSwap && isDayMates 
                      ? 'TICKETSWAP + DAYMATES DUAL' 
                      : isTicketSwap 
                        ? 'CINEMA WRITTEN TICKET' 
                        : 'MOVIE BUDDY COMPANION'}
                  </span>
                  {isTicketSwap && savings > 0 ? (
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      isDarkMode 
                        ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' 
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    }`}>
                      ₹{savings} OFF ({savingsPct}%)
                    </span>
                  ) : isDayMates ? (
                    <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded border ${
                      sellingPrice === 0 
                        ? (isDarkMode ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600')
                        : (isDarkMode ? 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400' : 'bg-indigo-50 border-indigo-100 text-indigo-600')
                    }`}>
                      {sellingPrice === 0 ? 'SPONSORED (FREE)' : 'COST SPLIT'}
                    </span>
                  ) : null}
                </div>

                <h4 className={`text-xl font-bold font-display mt-3 leading-tight tracking-tight capitalize ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  {movieName || "Movie Title Placeholder"}
                </h4>

                <div className={`flex items-center gap-1.5 text-xs mt-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-600'
                }`}>
                  <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="truncate font-medium">{theatreName || "Theater Destination, City"}</span>
                </div>
              </div>

              {/* Middle Grid */}
              <div className={`py-4 grid grid-cols-2 gap-y-3 gap-x-1.5 font-mono text-xs border-b border-dashed ${
                isDarkMode ? 'border-gray-850' : 'border-slate-100'
              }`}>
                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${
                    isDarkMode ? 'text-gray-550' : 'text-slate-400'
                  }`}>SHOW DATE / TIME</p>
                  <p className={`text-xs truncate mt-0.5 font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    {showTime ? new Date(showTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Not Configured Yet"}
                  </p>
                </div>

                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${
                    isDarkMode ? 'text-gray-550' : 'text-slate-400'
                  }`}>SEAT INFO</p>
                  <p className={`text-xs truncate mt-0.5 font-semibold ${
                    isDarkMode ? 'text-white' : 'text-slate-800'
                  }`}>
                    {seatNumber || "e.g. Box-F2"}
                  </p>
                </div>

                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${
                    isDarkMode ? 'text-gray-550' : 'text-slate-400'
                  }`}>ORIGINAL TICKET</p>
                  <p className={`text-xs line-through mt-0.5 ${
                    isDarkMode ? 'text-gray-500' : 'text-slate-450'
                  }`}>₹{originalPrice || "0"}</p>
                </div>

                <div>
                  <p className={`text-[9px] uppercase font-bold tracking-wider ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    {isTicketSwap && isDayMates 
                      ? 'YOUR PRICE / SHARE' 
                      : isTicketSwap 
                        ? 'SWAP PRICE' 
                        : 'BUDDY CONTRIBUTION'}
                  </p>
                  <p className={`text-sm font-bold mt-0.5 ${
                    isDarkMode ? 'text-pink-400' : 'text-pink-600'
                  }`}>
                    {isDayMates && sellingPrice === 0 ? 'FREE' : `₹${sellingPrice}`}
                  </p>
                </div>
              </div>

              {/* Lower Section (Barcode & Ticket info) */}
              <div className="pt-4 flex flex-col items-center">
                <span className={`text-[10px] font-mono mb-2 ${
                  isDarkMode ? 'text-gray-400' : 'text-slate-500'
                }`}>SELLER: {sellerName}</span>

                {/* Simulated Barcode bars */}
                <div className={`w-full py-3 px-6 rounded-lg flex flex-col items-center border transition ${
                  isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                }`}>
                  <div className="flex items-center justify-center gap-0.5 h-8 w-full opacity-70">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 4, 1, 1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1].map((width, i) => (
                      <div
                        key={i}
                        className={`h-full rounded-sm ${
                          isDarkMode ? 'bg-gray-500' : 'bg-slate-600'
                        }`}
                        style={{ width: `${width * 2}px` }}
                      />
                    ))}
                  </div>
                  <span className={`text-[10px] font-mono mt-1 uppercase ${
                    isDarkMode ? 'text-gray-500' : 'text-slate-450'
                  }`}>TS-{Math.floor(Date.now()/100000)}</span>
                </div>
              </div>
            </div>

            {/* Savings Tip box */}
            <div className={`rounded-xl p-4 text-xs border transition ${
              isDarkMode 
                ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                : 'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              <div className="flex gap-2.5">
                <span className={`p-1 px-1.5 rounded-md font-bold transition ${
                  isDarkMode ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-100 text-emerald-800'
                }`}>Tip</span>
                <p className="leading-relaxed">
                  Keeping your swap price 20-30% below the original BookMyShow or Paytm ticket price makes it sell up to 5x faster!
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
