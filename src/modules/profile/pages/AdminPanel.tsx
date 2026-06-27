import React, { useState, useEffect } from 'react';
import { ShieldAlert, RefreshCw, Landmark, ShieldCheck, DollarSign, Users, Award, Trash2 } from 'lucide-react';
import { Transaction, Listing } from '../../../shared/types';

interface AdminStats {
  totalListings: number;
  activeListingsCount: number;
  revenue: number;
  escrowBalance: number;
  disputesCount: number;
  commissionConfig: number;
  transactionsCount: number;
  usersCount: number;
  transactions: Transaction[];
  listings: Listing[];
}

interface AdminPanelProps {
  onDisputeResolved: () => void;
  onRefreshAllLists: () => void;
}

export default function AdminPanel({ onDisputeResolved, onRefreshAllLists }: AdminPanelProps) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [commissionInput, setCommissionInput] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      setStats(data);
      setCommissionInput(data.commissionConfig.toString());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(commissionInput);
    if (isNaN(amt) || amt < 0) return;
    
    try {
      const res = await fetch("/api/admin/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ safeModeCommission: amt }),
      });
      if (res.ok) {
        setActionSuccess(`Safe Mode commission set to ₹${amt}!`);
        fetchStats();
        setTimeout(() => setActionSuccess(""), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResolve = async (transactionId: string, resolution: 'REFUND_BUYER' | 'RELEASE_TO_SELLER') => {
    try {
      const res = await fetch("/api/admin/resolve-dispute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, resolution }),
      });
      
      if (res.ok) {
        setActionSuccess(`Dispute resolved! Decision: ${resolution === 'REFUND_BUYER' ? "Refunded Buyer" : "Paid Seller"}.`);
        fetchStats();
        onDisputeResolved();
        setTimeout(() => setActionSuccess(""), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteListingByAdmin = async (id: string) => {
    if (!confirm("Are you sure you want to remove this listing?")) return;
    try {
      await fetch(`/api/listings/${id}`, { method: 'DELETE' });
      setActionSuccess("Listing deleted successfully!");
      fetchStats();
      onRefreshAllLists();
      setTimeout(() => setActionSuccess(""), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex justify-center items-center py-20 text-white">
        <RefreshCw className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
            <Landmark className="w-8 h-8 text-pink-500" />
            Admin Operations Center
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            Superuser platform monitoring, escrow balance validation, and dispute mediation.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live Stats
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 mb-6">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stats Board */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <p className="text-gray-500 text-[10px] font-mono uppercase tracking-wider">TOTAL LISTINGS</p>
          <h4 className="text-2xl font-bold font-display mt-1">{stats?.totalListings}</h4>
          <p className="text-gray-400 text-[10px] mt-1">{stats?.activeListingsCount} active right now</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <p className="text-pink-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
            PLATFORM REVENUE
          </p>
          <h4 className="text-2xl font-bold font-display text-pink-400 mt-1">₹{stats?.revenue}</h4>
          <p className="text-gray-450 text-[10px] mt-1">From matched transactions fees</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-5">
          <p className="text-orange-400 text-[10px] font-mono uppercase tracking-wider">Active Escrow holds</p>
          <h4 className="text-2xl font-bold font-display text-orange-400 mt-1">₹{stats?.escrowBalance}</h4>
          <p className="text-gray-450 text-[10px] mt-1">Safeguarded buyers ledger</p>
        </div>

        <div className="bg-gray-900/60 border border-gray-850 rounded-xl p-5 border-l-4 border-l-orange-500">
          <p className="text-orange-500 text-[10px] font-mono uppercase tracking-wider">ACTIVE DISPUTES</p>
          <h4 className="text-2xl font-bold font-display text-orange-500 mt-1">{stats?.disputesCount}</h4>
          <p className="text-gray-450 text-[10px] mt-1">Pending resolution</p>
        </div>

      </div>

      <div className="grid lg:grid-cols-12 gap-8 mb-8">
        
        {/* Active Disputes & Operations Block */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold font-display flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            Dispute Arbitration Cases
          </h3>

          <div className="bg-gray-900/40 border border-gray-850 rounded-2xl overflow-hidden p-6">
            {stats?.transactions.filter(t => t.status === 'REVIEW').length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                ✅ No pending disputes. System is fully operational and healthy!
              </div>
            ) : (
              <div className="space-y-6">
                {stats?.transactions.filter(t => t.status === 'REVIEW').map((transaction) => {
                  const associatedListing = stats.listings.find(l => l.id === transaction.listingId);
                  
                  return (
                    <div key={transaction.id} className="p-5 bg-gray-950/80 border border-orange-500/20 rounded-xl relative">
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <div>
                          <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 font-mono text-[9px] rounded font-bold uppercase tracking-wider">
                            UNDER REVIEW
                          </span>
                          <h4 className="text-sm font-bold font-display text-white mt-1.5 capitalize">
                            Movie: {associatedListing ? associatedListing.movieName : "Unknown Ticket"}
                          </h4>
                          <p className="text-gray-400 text-xs mt-0.5">
                            Theatre: {associatedListing ? associatedListing.theatreName : "Unknown Theatre"}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-gray-500 text-[9px] font-mono">ESCROW LOCKED</p>
                          <p className="text-base font-bold text-orange-400 font-mono">₹{transaction.amountPaid}</p>
                        </div>
                      </div>

                      {/* Dispute Details */}
                      <div className="bg-gray-900 p-4 rounded-lg border border-gray-850 text-xs mb-5">
                        <p className="text-gray-450 font-semibold uppercase tracking-wider font-mono text-[9px]">
                          Filed Dispute Reason:
                        </p>
                        <p className="text-orange-400 mt-1 italic leading-relaxed">
                          "{transaction.disputeReason}"
                        </p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-gray-500 text-[10px]">
                          <span>Buyer: <b>{transaction.buyerName}</b></span>
                          <span>Seller: <b>{transaction.sellerName}</b></span>
                        </div>
                      </div>

                      {/* Decisive Mediation CTA Button Options */}
                      <div className="flex flex-col sm:flex-row items-center gap-2">
                        <button
                          onClick={() => handleResolve(transaction.id, 'REFUND_BUYER')}
                          className="w-full sm:w-auto px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          Refund Full Amount to Buyer
                        </button>
                        
                        <button
                          onClick={() => handleResolve(transaction.id, 'RELEASE_TO_SELLER')}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          Release Payout to Seller Maya
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Global Config side panel */}
        <div className="lg:col-span-4 space-y-6">
          <h3 className="text-lg font-bold font-display flex items-center gap-1.5">
            <DollarSign className="w-5 h-5 text-pink-500" />
            Platform Variables
          </h3>

          <div className="bg-gray-900/40 border border-gray-850 rounded-2xl p-6 space-y-6">
            <form onSubmit={handleUpdateCommission} className="space-y-4">
              <div>
                <label className="block text-gray-450 font-mono text-[10px] uppercase tracking-wider mb-2">
                  Safe Mode Platform Fee (₹)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-lg text-white text-xs font-mono focus:border-pink-500 focus:outline-none"
                    value={commissionInput}
                    onChange={(e) => setCommissionInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer"
                  >
                    Set Fee
                  </button>
                </div>
                <span className="text-gray-500 text-[10.5px] mt-1.5 block leading-normal">
                  Adjust commission dynamically. Default is <b>₹10</b> per transaction.
                </span>
              </div>
            </form>

            <div className="border-t border-gray-850 pt-5">
              <h4 className="text-xs font-bold font-mono tracking-wider text-gray-450 uppercase mb-3">
                Current Registered Users
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span>Raghu Raman (Buyer)</span>
                  <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span>Maya Sharma (Seller)</span>
                  <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span>Priya Patel (Seller)</span>
                  <span className="text-emerald-400 font-bold font-mono">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Database Inventory lists */}
      <h3 className="text-lg font-bold font-display text-white mb-4">
        All Platform Listings Inventory
      </h3>

      <div className="bg-gray-900/40 border border-gray-850 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-850 bg-gray-950/45 font-mono text-gray-400">
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Movie Title</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Theatre & City</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Seller</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Prices</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px]">Status</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-[10px] text-right">Operation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-850">
              {stats?.listings.map((listing) => (
                <tr key={listing.id} className="hover:bg-gray-900/20 text-white">
                  <td className="p-4 font-semibold text-gray-200 capitalise">{listing.movieName}</td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">{listing.theatreName}</td>
                  <td className="p-4 text-gray-300 font-mono text-[11px]">{listing.sellerName}</td>
                  <td className="p-4 font-mono text-gray-300">
                    <span className="line-through text-gray-500">₹{listing.originalPrice}</span>
                    <span className="text-pink-400 font-bold ml-2">₹{listing.sellingPrice}</span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold uppercase ${
                      listing.status === 'AVAILABLE' ? 'bg-emerald-500/15 text-emerald-400' :
                      listing.status === 'COMPLETED' ? 'bg-indigo-500/15 text-indigo-400' :
                      listing.status === 'MATCH_REQUESTED' ? 'bg-orange-500/15 text-orange-400' :
                      'bg-gray-800 text-gray-400'
                    }`}>
                      {listing.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteListingByAdmin(listing.id)}
                      className="p-1 px-2.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 rounded transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
