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
  }) => void;
  onCancel: () => void;
  sellerName: string;
}

const POSTER_PRESETS = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80", // cinema halls
  "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&q=80", // red curtains
  "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80", // blue seats
  "https://images.unsplash.com/photo-1478720143033-6a972678aa30?w=500&q=80"  // projector
];

export default function ListingForm({ onSubmit, onCancel, sellerName }: ListingFormProps) {
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
    if (!movieName || !theatreName || !showTime || !seatNumber || originalPrice <= 0 || sellingPrice <= 0) {
      setErrorMsg("Please fill in all required fields and verify pricing.");
      return;
    }

    if (sellingPrice >= originalPrice) {
      setErrorMsg("Selling price must be less than original price so buyes can see real savings!");
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
      description
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Inputs Panel */}
        <div className="lg:col-span-7 bg-gray-900/60 border border-gray-800 rounded-2xl p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold font-display text-white flex items-center gap-2">
              <Film className="w-6 h-6 text-pink-500" />
              Create Movie Ticket Listing
            </h2>
            <p className="text-gray-400 text-xs mt-1">
              Publish your ticket and receive cash instantly once swapped.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Movie Title */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                Movie Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pushpa 2: The Rule, Avengers: Doomsday"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                value={movieName}
                onChange={(e) => {
                  setMovieName(e.target.value);
                  setErrorMsg("");
                }}
              />
            </div>

            {/* Theatre location */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                Theatre & City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PVR Forum Mall, Bengaluru"
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
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
                <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                  Show Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-3 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                  value={showTime}
                  onChange={(e) => {
                    setShowTime(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                  Seat Number / Row *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Row K - Seat 13, 14"
                  className="w-full px-3 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                  value={seatNumber}
                  onChange={(e) => {
                    setSeatNumber(e.target.value);
                    setErrorMsg("");
                  }}
                />
              </div>
            </div>

            {/* Original vs Selling Prices */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-950/40 p-4 rounded-xl border border-gray-800/40">
              <div>
                <label className="block text-gray-400 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                  Original Price (₹) *
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  className="w-full px-3 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                  value={originalPrice}
                  onChange={(e) => {
                    setOriginalPrice(Math.max(0, Number(e.target.value)));
                    setErrorMsg("");
                  }}
                />
              </div>

              <div>
                <label className="block text-pink-400 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono flex items-center gap-1">
                  Selling Price (₹) *
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                </label>
                <input
                  type="number"
                  required
                  min="5"
                  className="w-full px-3 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                  value={sellingPrice}
                  onChange={(e) => {
                    setSellingPrice(Math.max(0, Number(e.target.value)));
                    setErrorMsg("");
                  }}
                />
              </div>
            </div>

            {/* Graphic Selection */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                Booking Reference Screenshot / Graphic
              </label>
              
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setImageTab('presets')}
                  className={`px-3 py-1 text-xs font-mono rounded ${imageTab === 'presets' ? 'bg-pink-600 text-white' : 'bg-gray-850 text-gray-400'}`}
                >
                  Gallery Presets
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('custom')}
                  className={`px-3 py-1 text-xs font-mono rounded ${imageTab === 'custom' ? 'bg-pink-600 text-white' : 'bg-gray-850 text-gray-400'}`}
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
                      className={`relative aspect-video rounded-lg overflow-hidden border-2 ${screenshotUrl === preset ? 'border-pink-500' : 'border-transparent'}`}
                    >
                      <img src={preset} className="w-full h-full object-cover" alt={`Preset ${idx}`} />
                    </button>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  placeholder="Paste image web address URL or Base64 string..."
                  className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none placeholder-gray-600"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                />
              )}
            </div>

            {/* Description Notes */}
            <div>
              <label className="block text-gray-300 text-xs font-medium mb-1.5 uppercase tracking-wider font-mono">
                Extra Note/Reason for reselling
              </label>
              <textarea
                placeholder="Suggest why you are selling, details of ticket collector codes, cinema seating view perks, or meet guidelines..."
                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none h-24 resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Submit Cancel Controls */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
              <button
                type="submit"
                className="flex-1 px-5 py-3 bg-pink-600 hover:bg-pink-500 text-white font-semibold rounded-xl transition cursor-pointer"
              >
                Post Listing (Free)
              </button>
              
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-3 bg-gray-800 hover:bg-gray-700 text-gray-350 font-semibold rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Live SVG Ticket Preview Sticky */}
        <div className="lg:col-span-5 relative">
          <div className="sticky top-6 space-y-6">
            <h3 className="text-xs uppercase font-mono tracking-widest text-indigo-400 font-bold mb-1">
              Live Digital Ticket Preview
            </h3>

            {/* Stylized Ticket Stub Container */}
            <div className="relative rounded-2xl overflow-hidden glass-card p-5 border-l-4 border-l-pink-500">
              <div className="absolute top-1/2 -translate-y-1/2 -left-[14px] w-7 h-7 bg-gray-950 border border-gray-800 rounded-full z-10" />
              <div className="absolute top-1/2 -translate-y-1/2 -right-[14px] w-7 h-7 bg-gray-950 border border-gray-800 rounded-full z-10" />

              {/* Upper Section */}
              <div className="pb-4 border-b border-dashed border-gray-800">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-400 font-mono font-bold rounded">
                    CINEMA WRITTEN TICKET
                  </span>
                  {savings > 0 && (
                    <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold rounded">
                      ₹{savings} OFF ({savingsPct}%)
                    </span>
                  )}
                </div>

                <h4 className="text-xl font-bold font-display text-white mt-3 leading-tight tracking-tight capitalize">
                  {movieName || "Movie Title Placeholder"}
                </h4>

                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                  <span className="truncate">{theatreName || "Theater Destination, City"}</span>
                </div>
              </div>

              {/* Middle Grid */}
              <div className="py-4 grid grid-cols-2 gap-y-3 gap-x-1.5 font-mono text-xs border-b border-dashed border-gray-800">
                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider">SHOW DATE / TIME</p>
                  <p className="text-white text-xs truncate mt-0.5 font-semibold">
                    {showTime ? new Date(showTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : "Not Configured Yet"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-[9px] uppercase font-bold tracking-wider">SEAT INFO</p>
                  <p className="text-white text-xs truncate mt-0.5 font-semibold">
                    {seatNumber || "e.g. Box-F2"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-400 text-[9px] uppercase font-bold tracking-wider">ORIGINAL TICKET</p>
                  <p className="text-gray-500 text-xs line-through mt-0.5">₹{originalPrice || "0"}</p>
                </div>

                <div>
                  <p className="text-pink-400 text-[9px] uppercase font-bold tracking-wider">SWAP PRICE</p>
                  <p className="text-pink-400 text-sm font-bold mt-0.5">₹{sellingPrice || "0"}</p>
                </div>
              </div>

              {/* Lower Section (Barcode & Ticket info) */}
              <div className="pt-4 flex flex-col items-center">
                <span className="text-gray-400 text-[10px] font-mono mb-2">SELLER: {sellerName}</span>

                {/* Simulated Barcode bars */}
                <div className="w-full bg-white/5 py-3 px-6 rounded-lg flex flex-col items-center border border-white/5">
                  <div className="flex items-center justify-center gap-0.5 h-8 w-full opacity-70">
                    {[1, 3, 1, 2, 4, 1, 3, 2, 1, 3, 4, 1, 1, 2, 3, 1, 2, 4, 1, 2, 3, 2, 1, 1].map((width, i) => (
                      <div
                        key={i}
                        className={`bg-gray-400 h-full rounded-sm`}
                        style={{ width: `${width * 2}px` }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 mt-1 uppercase">TS-{Math.floor(Date.now()/100000)}</span>
                </div>
              </div>
            </div>

            {/* Savings Tip box */}
            <div className="bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-4 text-emerald-400 text-xs">
              <div className="flex gap-2.5">
                <span className="p-1 px-1.5 rounded-md bg-emerald-500/10 text-emerald-400 font-bold">Tip</span>
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
