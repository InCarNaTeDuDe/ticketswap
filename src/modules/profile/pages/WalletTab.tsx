import React, { useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, HelpCircle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { Wallet as WalletType, WalletEntry } from '../../../shared/types';

interface WalletTabProps {
  wallet: WalletType;
  userName: string;
  onRefill: () => void;
  onWithdraw: (amount: number) => Promise<void>;
}

export default function WalletTab({ wallet, userName, onRefill, onWithdraw }: WalletTabProps) {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(withdrawAmount);
    setErrorMsg("");
    setSuccessMsg("");
    
    if (isNaN(amt) || amt <= 0) {
      setErrorMsg("Please enter a valid amount to withdraw.");
      return;
    }

    if (amt > wallet.balance) {
      setErrorMsg(`Insufficient spendable balance! You cannot withdraw more than your available wallet balance of ₹${wallet.balance}.`);
      return;
    }

    try {
      setLoading(true);
      await onWithdraw(amt);
      setSuccessMsg(`₹${amt} withdrawn successfully to bank account (Simulated IMPS/UPI Transfer)!`);
      setWithdrawAmount("");
    } catch (e: any) {
      setErrorMsg(e.message || "Withdrawal failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-white">
      
      {/* Upper Grid Card */}
      <div className="grid md:grid-cols-12 gap-6 mb-8">
        
        {/* Main Wallet Card (Glassmorphic) */}
        <div className="md:col-span-8 bg-gradient-to-tr from-gray-900/90 via-slate-900 to-indigo-900/60 border border-indigo-500/20 rounded-2xl p-6 md:p-8 relative overflow-hidden">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-pink-500/10 border border-pink-500/20 rounded-lg text-pink-400">
                <Wallet className="w-5 h-5" />
              </div>
              <span className="text-gray-400 text-xs font-mono tracking-widest uppercase">
                {userName}'s Swap Wallet
              </span>
            </div>
            
            <button
              onClick={onRefill}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-semibold transition active:scale-95 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refill ₹500
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <p className="text-gray-450 text-[10px] font-mono uppercase tracking-wider">Spendable Balance</p>
              <h3 className="text-3xl md:text-4xl font-extrabold font-display text-white mt-1">
                ₹{wallet.balance}
              </h3>
            </div>

            <div>
              <p className="text-orange-400 text-[10px] font-mono uppercase tracking-wider flex items-center gap-1">
                Escrow Locked
                <span className="relative group">
                  <HelpCircle className="w-3 h-3 text-orange-400 cursor-help" />
                  <span className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 bg-gray-950 border border-gray-800 text-[9px] p-2 rounded shadow-xl leading-normal text-gray-300 font-sans z-50 normal-case">
                    Held temporarily in Safe Mode match transactions until physical ticket swap OTP verification succeeds.
                  </span>
                </span>
              </p>
              <h3 className="text-3xl md:text-4xl font-extrabold font-display text-orange-400 mt-1">
                ₹{wallet.escrowBalance}
              </h3>
            </div>

            <div className="col-span-2 md:col-span-1 border-t md:border-t-0 md:border-l border-gray-800/60 pt-4 md:pt-0 md:pl-6">
              <p className="text-gray-450 text-[10px] font-mono uppercase tracking-wider">Total Bank Payouts</p>
              <h3 className="text-xl md:text-2xl font-bold font-display text-emerald-400 mt-1">
                ₹{wallet.totalPayouts}
              </h3>
            </div>
          </div>
        </div>

        {/* Instant Withdraw Card */}
        <div className="md:col-span-4 bg-gray-900/60 border border-gray-850 rounded-2xl p-6">
          <h4 className="text-sm font-semibold font-display mb-3 text-white flex items-center gap-1.5">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            Payout Funds
          </h4>
          <p className="text-gray-400 text-xs leading-relaxed mb-4">
            Payout your earned ticket rewards directly back into your bank account.
          </p>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₹</span>
              <input
                type="number"
                placeholder="Amount e.g. 200"
                className="w-full pl-8 pr-4 py-2.5 bg-gray-950 border border-gray-800 rounded-xl text-white text-sm focus:border-pink-500 focus:outline-none"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 rounded-xl text-xs font-bold font-display tracking-wider uppercase transition cursor-pointer"
            >
              {loading ? "Processing..." : "Instant Payout"}
            </button>
          </form>
        </div>

      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-2 mb-6">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl flex items-center gap-2 mb-6">
          <ArrowDownLeft className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Wallet Ledger System */}
      <h3 className="text-base font-bold font-display text-white mb-4 flex items-center gap-2">
        <Layers className="w-4 h-4 text-indigo-400" />
        Transaction Ledger
      </h3>

      <div className="bg-gray-900/40 border border-gray-850 rounded-2xl overflow-hidden">
        {wallet.ledger && wallet.ledger.length > 0 ? (
          <div className="divide-y divide-gray-850">
            {wallet.ledger.slice().reverse().map((entry) => {
              const dateStr = new Date(entry.timestamp).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const isPositive = entry.amount > 0;

              return (
                <div key={entry.id} className="p-4 flex items-center justify-between gap-4 hover:bg-gray-900/30 transition duration-150">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      entry.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-400' :
                      entry.type === 'ESCROW_HOLD' ? 'bg-orange-500/10 text-orange-400' :
                      entry.type === 'ESCROW_RELEASE' ? 'bg-indigo-500/10 text-indigo-400' :
                      entry.type === 'PAYOUT' ? 'bg-red-500/10 text-red-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {entry.type === 'CREDIT' || entry.type === 'ESCROW_RELEASE' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    
                    <div>
                      <p className="text-white text-xs font-semibold leading-snug">
                        {entry.description}
                      </p>
                      <p className="text-gray-500 text-[10px] uppercase font-mono mt-0.5">
                        {dateStr} • ID: {entry.id.substring(0, 16)}
                      </p>
                    </div>
                  </div>

                  <span className={`text-sm font-bold font-mono ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isPositive ? "+" : ""}₹{entry.amount}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 text-xs">
            No transaction history recorded yet.
          </div>
        )}
      </div>

    </div>
  );
}
