import React from 'react';
import { Users, ArrowRight, MapPin, Sparkles } from 'lucide-react';
import { Listing } from '../../../shared/types';

interface DayMatesListingCardProps {
  listing: Listing;
  isDarkMode: boolean;
  isOwnListing: boolean;
  onSelect: (listing: Listing) => void;
}

export default function DayMatesListingCard({
  listing,
  isDarkMode,
  isOwnListing,
  onSelect,
}: DayMatesListingCardProps) {
  return (
    <div
      id={`daymates-card-${listing.id}`}
      className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden ${
        isDarkMode
          ? 'bg-gray-900/40 border-gray-850 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5'
          : 'bg-white border-slate-200 hover:border-pink-300 hover:shadow-xl hover:shadow-slate-100'
      }`}
    >
      {/* Dual indicator if the listing also has TicketSwap (resale) enabled! */}
      {listing.isTicketSwap && (
        <span className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 text-[9px] font-mono rounded-md font-bold bg-pink-500/10 text-pink-400 border border-pink-500/20 backdrop-blur-md flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 animate-spin" />
          TICKETSWAP DUAL
        </span>
      )}

      {isOwnListing && !listing.isTicketSwap && (
        <span className="absolute top-3.5 left-3.5 z-10 px-2 py-0.5 text-[9px] font-mono rounded font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 backdrop-blur-md">
          YOUR REQUEST
        </span>
      )}

      {/* cost tag */}
      <div
        className={`absolute top-3.5 right-3.5 z-10 text-white font-bold text-[10px] px-2 py-0.5 rounded font-mono shadow-md ${
          listing.sellingPrice === 0 ? 'bg-emerald-500' : 'bg-indigo-600'
        }`}
      >
        {listing.sellingPrice === 0 ? 'FREE / SPONSORED' : `SPLIT: ₹${listing.sellingPrice}`}
      </div>

      {/* Header image card */}
      <div className="relative aspect-video bg-zinc-950 overflow-hidden">
        <img
          referrerPolicy="no-referrer"
          src={listing.screenshotUrl}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          alt={`Cinema preview of ${listing.movieName}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
      </div>

      {/* Text Details Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className={`text-lg font-extrabold font-display leading-snug group-hover:text-pink-500 transition-colors ${
              isDarkMode ? 'text-white' : 'text-slate-850'
            }`}
          >
            {listing.movieName}
          </h3>

          <div
            className={`flex items-center gap-1 text-xs mt-1.5 ${
              isDarkMode ? 'text-gray-400' : 'text-slate-550'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-pink-500 shrink-0" />
            <span className="truncate">{listing.theatreName}</span>
          </div>

          <div
            className={`grid grid-cols-2 gap-3 py-3 border-y my-3.5 text-[11px] ${
              isDarkMode ? 'border-gray-850/60' : 'border-slate-100'
            }`}
          >
            <div>
              <p className={`text-[9px] font-mono uppercase ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                Showtime
              </p>
              <p className={`font-semibold mt-0.5 truncate uppercase ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                {new Date(listing.showTime).toLocaleString(undefined, {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            </div>

            <div>
              <p className={`text-[9px] font-mono uppercase ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                Seat / Row
              </p>
              <p className={`font-semibold mt-0.5 truncate uppercase ${isDarkMode ? 'text-white' : 'text-slate-700'}`}>
                {listing.seatNumber}
              </p>
            </div>
          </div>

          <p
            className={`text-[11px] leading-relaxed mt-3.5 line-clamp-2 italic ${
              isDarkMode ? 'text-gray-400' : 'text-slate-600'
            }`}
          >
            "{listing.description}"
          </p>
        </div>

        {/* Pricing section and Swapping match details */}
        <div className="mt-5 pt-3.5 border-t border-dashed border-gray-800">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className={`text-[9px] font-mono ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                TOTAL RATE
              </p>
              <p className={`text-xs line-through ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
                ₹{listing.originalPrice}
              </p>
            </div>

            <div className="text-right">
              <p className={`text-[9px] font-mono font-bold ${isDarkMode ? 'text-pink-400' : 'text-pink-600'}`}>
                {listing.sellingPrice === 0 ? 'COMPANION' : 'YOUR SHARE'}
              </p>
              <p
                className={`text-xl font-extrabold font-display ${
                  isDarkMode ? 'text-pink-400' : 'text-pink-600'
                }`}
              >
                {listing.sellingPrice === 0 ? 'FREE' : `₹${listing.sellingPrice}`}
              </p>
            </div>
          </div>

          {listing.status === 'AVAILABLE' ? (
            <button
              onClick={() => onSelect(listing)}
              aria-label={`Initiate companion swap process for seat ${listing.seatNumber} of ${listing.movieName}`}
              className="touch-target-btn w-full py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold font-display rounded-xl text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              Connect with Buddy
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          ) : (
            <div
              className={`w-full py-2.5 rounded-xl text-center text-xs uppercase tracking-wider font-mono font-bold ${
                isDarkMode ? 'bg-gray-900 text-gray-500' : 'bg-slate-100 text-slate-450'
              }`}
            >
              Matched / Watching
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
