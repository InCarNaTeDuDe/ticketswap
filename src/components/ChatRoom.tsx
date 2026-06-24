import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  Ticket,
  User,
  ClipboardList,
  ShieldAlert,
  CheckCircle,
  ShieldQuestion,
  HelpCircle,
  XCircle,
} from "lucide-react";
import { Transaction, Listing, ChatMessage } from "../types";

interface ChatRoomProps {
  transactionId: string;
  activeUserId: string;
  activeUserName: string;
  onStatusUpdate: () => void;
  isDarkMode?: boolean;
}

export default function ChatRoom({
  transactionId,
  activeUserId,
  activeUserName,
  onStatusUpdate,
  isDarkMode = true,
}: ChatRoomProps) {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [disputeReason, setDisputeReason] = useState("");
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  const [aiLoading, setAiLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const messageContainerRef = useRef<HTMLDivElement | null>(null);

  const fetchChatDetails = async () => {
    try {
      // Get transaction
      const resStats = await fetch("/api/admin/stats");
      const stats = await resStats.json();
      const tx: Transaction = stats.transactions.find(
        (t: any) => t.id === transactionId,
      );
      if (tx) {
        setTransaction(tx);
        const listObj = stats.listings.find((l: any) => l.id === tx.listingId);
        setListing(listObj);
      }

      // Get messages
      const resMsg = await fetch(`/api/transactions/${transactionId}/messages`);
      const msgData = await resMsg.json();
      setMessages(msgData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatDetails();
    const interval = setInterval(fetchChatDetails, 4000); // Poll chat log every 4s
    return () => clearInterval(interval);
  }, [transactionId]);

  useEffect(() => {
    // Scroll chat container to bottom smoothly without triggering parent window jumps
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    try {
      const res = await fetch(`/api/transactions/${transactionId}/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: activeUserId,
          senderName: activeUserName,
          text: inputText,
        }),
      });
      if (res.ok) {
        setInputText("");
        fetchChatDetails();
        onStatusUpdate();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSellerResponse = async (action: "ACCEPT" | "REJECT") => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, sellerId: activeUserId }),
      });
      if (res.ok) {
        setSuccessMsg(
          `You have successfully ${action === "ACCEPT" ? "accepted" : "rejected"} the request.`,
        );
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Connect Mode simulated 10-minute timeout refund
  const handleSimulateTimeout = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/timeout`, {
        method: "POST",
      });
      if (res.ok) {
        setSuccessMsg(
          "10 minute timeout simulated. Platform fee refunded back to buyer wallet!",
        );
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancelTransaction = async () => {
    const reason = prompt(
      "Enter reason for cancellation (Buyer inspection mismatch / meet failure):",
    );
    if (reason === null) return;
    try {
      const res = await fetch(`/api/transactions/${transactionId}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: reason || "Negotiations failed during inspection",
          userId: activeUserId,
        }),
      });
      if (res.ok) {
        setSuccessMsg("Escrow deal cancelled and buyer fully refunded.");
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit OTP for dual physical check
  const handleVerifyOTP = async (
    verifyRole: "BUYER_INPUT_SELLER_OTP" | "SELLER_INPUT_BUYER_OTP",
  ) => {
    setErrorMsg("");
    if (!otpInput) {
      setErrorMsg("Please enter the 6-digit OTP code first.");
      return;
    }
    try {
      const res = await fetch(`/api/transactions/${transactionId}/otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otp: otpInput,
          role: verifyRole,
          userId: activeUserId,
        }),
      });
      if (res.ok) {
        setOtpInput("");
        setSuccessMsg("OTP Verified successfully!");
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Incorrect OTP code. Try again!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Raise Dispute during escrow
  const handleRaiseDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    try {
      const res = await fetch(`/api/transactions/${transactionId}/dispute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: disputeReason,
          userId: activeUserId,
          userName: activeUserName,
        }),
      });
      if (res.ok) {
        setShowDisputeModal(false);
        setSuccessMsg(
          "Dispute officially raised. Escrow funds are now locked under REVIEW state!",
        );
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Trigger instantaneous automatic Settle Escrow simulating 60-m clock expiration
  const handleSimulateSettle = async () => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/settle`, {
        method: "POST",
      });
      if (res.ok) {
        setSuccessMsg(
          "60-minute window elapsed. Funds successfully settled to Seller wallet!",
        );
        fetchChatDetails();
        onStatusUpdate();
        setTimeout(() => setSuccessMsg(""), 3500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini AI simulated buyer/seller auto message response
  const triggerAiResponse = async () => {
    try {
      setAiLoading(true);
      setErrorMsg("");
      const isBuyerActive = activeUserId === transaction?.buyerId;
      const res = await fetch("/api/ai/chat-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          activeRole: isBuyerActive ? "BUYER" : "SELLER",
        }),
      });
      if (res.ok) {
        fetchChatDetails();
        onStatusUpdate();
      } else {
        setErrorMsg(
          "Gemini API is unavailable right now. Executing offline chatbot fallback instead.",
        );
        // retry local
        fetchChatDetails();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading || !transaction) {
    return (
      <div className="flex justify-center items-center py-20">
        <Sparkles className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  const isBuyer = activeUserId === transaction.buyerId;
  const isSeller = activeUserId === transaction.sellerId;
  const showSellerActionForm =
    isSeller && transaction.status === "MATCH_REQUESTED";

  return (
    <div
      className={`chat-container max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 h-auto lg:h-[85vh] ${
        isDarkMode ? "text-white" : "text-slate-800"
      }`}
    >
      <div className="chat-layout-grid grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:h-full">
        {/* 1. Left Control Panel containing Transaction, meeting status and checkout escrows */}
        <section
          aria-label="Escrow Swap Transaction Control Centre"
          className={`chat-control-panel lg:col-span-4 border rounded-2xl p-4 sm:p-5 flex flex-col justify-between lg:overflow-y-auto h-auto lg:h-full ${
            isDarkMode
              ? "bg-gray-900/60 border-gray-850 text-white"
              : "bg-white border-slate-200 text-slate-800 shadow-sm"
          }`}
        >
          <div>
            {/* Status Header info */}
            <div
              className={`pb-4 border-b mb-4 ${
                isDarkMode ? "border-gray-850" : "border-slate-100"
              }`}
              id="chat-swap-header"
            >
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] border uppercase ${
                  isDarkMode
                    ? "bg-pink-500/10 text-pink-400 border-pink-500/20"
                    : "bg-pink-50 text-pink-600 border-pink-200"
                }`}
                aria-label={`Security mode is ${transaction.mode}`}
              >
                {transaction.mode} MODE
              </span>
              <h3
                className={`text-base font-bold font-display mt-1.5 leading-snug ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                Swap: {listing?.movieName}
              </h3>
              <p
                className={`text-xs mt-1 truncate ${
                  isDarkMode ? "text-gray-400" : "text-slate-500"
                }`}
              >
                📍 {listing?.theatreName}
              </p>
            </div>

            {/* Workflow details */}
            <div className="space-y-4" aria-live="polite" aria-atomic="true">
              {/* MATCH REQUEST SENT state */}
              {transaction.status === "MATCH_REQUESTED" && (
                <div
                  className={`border rounded-xl p-4 ${
                    isDarkMode
                      ? "bg-yellow-950/20 border-yellow-500/20 text-yellow-400"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                  role="status"
                >
                  <p className="font-bold text-xs flex items-center gap-1.5 font-display">
                    Match Pending Seller Response
                  </p>
                  <p
                    className={`text-xs leading-relaxed mt-1.5 ${
                      isDarkMode ? "text-gray-400" : "text-amber-700/90"
                    }`}
                  >
                    The checkout is held. If you are Maya/Priya, you can Accept
                    or Reject this deal.
                  </p>

                  {transaction.mode === "CONNECT" && (
                    <div
                      className={`mt-3 pt-3 border-t ${
                        isDarkMode
                          ? "border-yellow-900/30"
                          : "border-amber-200/50"
                      }`}
                    >
                      <p
                        className={`text-[10px] font-mono ${
                          isDarkMode ? "text-yellow-500" : "text-amber-600"
                        }`}
                      >
                        CONNECT COUNTER TIMEOUT (10m)
                      </p>
                      <button
                        onClick={handleSimulateTimeout}
                        aria-label="Simulate 10 minute contact expiration timeout refund"
                        className="touch-target-chat-btn mt-2 w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-xs font-bold text-white transition cursor-pointer"
                      >
                        Simulate 10m Expiration Refund
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Seller Action Controls */}
              {showSellerActionForm && (
                <div
                  className={`p-4 border rounded-xl space-y-3 ${
                    isDarkMode
                      ? "bg-gray-950 border-pink-500/20"
                      : "bg-pink-50/40 border-pink-100"
                  }`}
                  role="group"
                  aria-label="Seller validation action controls"
                >
                  <p
                    className={`font-semibold font-display text-xs ${
                      isDarkMode ? "text-pink-400" : "text-pink-600"
                    }`}
                  >
                    Respond to Resale Buyer
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSellerResponse("ACCEPT")}
                      aria-label="Accept match request and initialize ticket swap transfer"
                      className="touch-target-chat-btn py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer transition text-center"
                    >
                      Accept Request
                    </button>
                    <button
                      onClick={() => handleSellerResponse("REJECT")}
                      aria-label="Reject match request and release escrow holds"
                      className="touch-target-chat-btn py-2.5 bg-red-650 hover:bg-red-600 text-white font-bold rounded-lg text-xs cursor-pointer transition text-center"
                    >
                      Reject Request
                    </button>
                  </div>
                </div>
              )}

              {/* SAFE MODE meeting coordinates scheduler */}
              {transaction.mode === "SAFE" &&
                (transaction.status === "MEETING_SCHEDULED" ||
                  transaction.status === "OTP_PENDING") && (
                  <div
                    className={`border rounded-xl p-4 space-y-4 ${
                      isDarkMode
                        ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-300"
                        : "bg-indigo-50/50 border-indigo-150 text-indigo-900"
                    }`}
                    role="region"
                    aria-label="Meeting physical check rules"
                  >
                    <div className="flex items-center gap-1.5">
                      <Ticket
                        className={`w-4 h-4 shrink-0 ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                        aria-hidden="true"
                      />
                      <p
                        className={`font-bold text-xs font-display ${isDarkMode ? "text-indigo-300" : "text-indigo-700"}`}
                      >
                        Step 2: Meeting Venue Inspection
                      </p>
                    </div>
                    <p
                      className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-450" : "text-slate-600"}`}
                    >
                      Meet at the **Theatre Entrance/Gate of{" "}
                      {listing?.theatreName}**. Verify booking confirmation
                      codes, seat numbers, and dates. Apply OTPs below when
                      satisfied.
                    </p>

                    {/* OTP Exchange widgets */}
                    <div
                      className={`p-3 rounded-lg border space-y-2 text-xs ${
                        isDarkMode
                          ? "bg-gray-950/80 border-gray-850"
                          : "bg-white border-slate-200"
                      }`}
                    >
                      <div
                        className={`flex justify-between border-b pb-2 ${
                          isDarkMode ? "border-gray-850" : "border-slate-100"
                        }`}
                      >
                        <span
                          className={
                            isDarkMode ? "text-gray-400" : "text-slate-500"
                          }
                        >
                          Your Verification OTP:
                        </span>
                        <span
                          className={`font-mono font-bold text-sm tracking-widest leading-none ${isDarkMode ? "text-pink-400" : "text-pink-600"}`}
                          aria-label={`Your verification OTP is ${isBuyer ? transaction.buyerOtp : transaction.sellerOtp}`}
                        >
                          {isBuyer
                            ? transaction.buyerOtp
                            : transaction.sellerOtp}
                        </span>
                      </div>
                      <div
                        className={`text-[10px] ${isDarkMode ? "text-gray-450" : "text-slate-400"}`}
                      >
                        {isBuyer
                          ? "Share this with Maya physically once she verifies your payment status."
                          : "Share this with Raghu once he physically inspects your booking QR."}
                      </div>
                    </div>

                    {/* INPUT opposite OTP code */}
                    <div className="space-y-2">
                      <label
                        htmlFor="opposite-party-otp"
                        className={`block text-[10px] font-bold font-mono ${isDarkMode ? "text-gray-300" : "text-slate-600"}`}
                      >
                        ENTER {isBuyer ? "SELLER’S" : "BUYER’S"} OTP CODE:
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="opposite-party-otp"
                          type="text"
                          maxLength={6}
                          placeholder="e.g. 195482"
                          className={`touch-target-input w-full px-3 py-2 font-mono text-xs rounded-lg focus:border-pink-500 focus:outline-none ${
                            isDarkMode
                              ? "bg-gray-950 border-gray-850 text-white"
                              : "bg-white border-slate-250 text-slate-900 shadow-inner"
                          }`}
                          value={otpInput}
                          onChange={(e) => setOtpInput(e.target.value)}
                          aria-label="6-digit verification code"
                        />
                        <button
                          onClick={() =>
                            handleVerifyOTP(
                              isBuyer
                                ? "BUYER_INPUT_SELLER_OTP"
                                : "SELLER_INPUT_BUYER_OTP",
                            )
                          }
                          className="touch-target-chat-btn px-4 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-lg text-xs whitespace-nowrap cursor-pointer transition"
                        >
                          Verify OTP
                        </button>
                      </div>
                    </div>

                    {/* Cancel deal option */}
                    <button
                      onClick={handleCancelTransaction}
                      aria-label="Cancel transaction swap and refund buyer fully"
                      className={`touch-target-chat-btn w-full py-2.5 font-semibold rounded-lg text-xs transition cursor-pointer border ${
                        isDarkMode
                          ? "bg-gray-900 border-red-500/20 text-red-400 hover:bg-rose-950/10"
                          : "bg-white border-red-200 text-red-600 hover:bg-red-50"
                      }`}
                    >
                      Cancel Swap & Refund Buyer
                    </button>
                  </div>
                )}

              {/* DISPUTE & PENDING DISPUTES WINDOW */}
              {transaction.status === "DISPUTE_WINDOW" && (
                <div
                  className={`border rounded-xl p-4 space-y-3.5 ${
                    isDarkMode
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-400"
                      : "bg-emerald-50 border-emerald-200 text-emerald-800"
                  }`}
                  role="region"
                  aria-label="60-minute dispute filing window controls"
                >
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4.5 h-4.5" aria-hidden="true" />
                    <span className="font-bold text-xs font-display">
                      60m Dispute Window Active
                    </span>
                  </div>
                  <p
                    className={`text-[11px] leading-relaxed ${isDarkMode ? "text-gray-450" : "text-emerald-900/80"}`}
                  >
                    Buyer inspects entry scan status inside theater hall doors.
                    If you discover double booking or invalid barcode scan
                    failures, raise a dispute within 60 mins.
                  </p>

                  <div
                    className={`grid grid-cols-1 gap-2 pt-2 border-t ${
                      isDarkMode
                        ? "border-emerald-900/30"
                        : "border-emerald-200/50"
                    }`}
                  >
                    <button
                      onClick={() => setShowDisputeModal(true)}
                      aria-label="File a formal dispute of ticket scanning issue"
                      className={`touch-target-chat-btn py-2.5 rounded-lg font-bold font-display text-xs cursor-pointer transition flex items-center justify-center gap-1.5 border ${
                        isDarkMode
                          ? "bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border-rose-500/20"
                          : "bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border-red-200"
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" aria-hidden="true" />
                      Raise Ticket Dispute
                    </button>

                    <button
                      onClick={handleSimulateSettle}
                      aria-label="Force immediate settlement simulated elapsed clock"
                      className="touch-target-chat-btn py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold font-display text-xs cursor-pointer transition flex items-center justify-center gap-1"
                    >
                      Simulate 60m Clock Elapse Settle
                    </button>
                  </div>
                </div>
              )}

              {/* REVIEW / DISPUTED State */}
              {transaction.status === "REVIEW" && (
                <div
                  className={`border p-4 rounded-xl ${
                    isDarkMode
                      ? "bg-red-950/30 border-red-500/30 text-red-400"
                      : "bg-red-50 border-red-200 text-red-800"
                  }`}
                  role="alert"
                >
                  <p className="font-bold text-xs font-display flex items-center gap-1.5">
                    <ShieldAlert className="w-4.5 h-4.5" aria-hidden="true" />
                    Transaction Disputed & Frozen
                  </p>
                  <p
                    className={`text-[11px] leading-relaxed mt-2 ${isDarkMode ? "text-gray-440" : "text-red-700"}`}
                  >
                    Escrow funds of ₹{transaction.amountPaid} are frozen
                    temporarily. Admin (log in as Admin persona) can review the
                    claims and handle resolution refunds.
                  </p>
                </div>
              )}

              {/* COMPLETED State details */}
              {transaction.status === "COMPLETED" && (
                <div
                  className={`border p-4 rounded-xl text-center space-y-2 ${
                    isDarkMode
                      ? "bg-indigo-950/20 border-indigo-500/20 text-indigo-300"
                      : "bg-indigo-50 border-indigo-150 text-indigo-900"
                  }`}
                  role="status"
                >
                  <CheckCircle
                    className={`w-8 h-8 mx-auto ${isDarkMode ? "text-indigo-400" : "text-indigo-600"}`}
                    aria-hidden="true"
                  />
                  <h4 className="font-bold text-xs font-display">
                    Resale Completed Successfully
                  </h4>
                  <p
                    className={`text-[10.5px] leading-relaxed ${isDarkMode ? "text-gray-450" : "text-slate-500"}`}
                  >
                    Connect chat/Safe Escrow complete. Earnings paid out, fee
                    resolved. Thanks for using TicketSwap!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Tips */}
          <div
            className={`pt-4 border-t hidden lg:block text-[10.5px] space-y-1 ${
              isDarkMode
                ? "border-gray-850/60 text-gray-500"
                : "border-slate-100 text-slate-400"
            }`}
          >
            <p
              className={`font-semibold ${isDarkMode ? "text-gray-400" : "text-slate-500"}`}
            >
              Swap Instructions:
            </p>
            <p>• Avoid paying cash until OTP dual matching complete.</p>
            <p>• Connect mode matching expires in 10 minutes.</p>
          </div>
        </section>

        {/* 2. Chat messaging viewport panel */}
        <section
          aria-label="Active Negotiator Chat Portal"
          className={`chat-message-panel lg:col-span-8 border rounded-2xl flex flex-col justify-between h-[500px] lg:h-full overflow-hidden relative ${
            isDarkMode
              ? "bg-gray-900/40 border-gray-850"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          {/* Chat Header controls */}
          <div
            className={`p-4 border-b flex items-center justify-between gap-4 ${
              isDarkMode
                ? "border-gray-850/80 bg-gray-950/25 text-white"
                : "border-slate-100 bg-slate-50/50 text-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center font-bold text-white uppercase"
                aria-hidden="true"
              >
                {isBuyer ? "M" : "R"}
              </div>
              <div>
                <p
                  className={`text-xs font-bold leading-none ${isDarkMode ? "text-white" : "text-slate-800"}`}
                >
                  {isBuyer ? transaction.sellerName : transaction.buyerName}
                </p>
                <p
                  className={`text-[10px] uppercase font-mono mt-1 ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}
                >
                  Active Match Portal
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={triggerAiResponse}
                disabled={aiLoading}
                aria-label="Simulate conversational co-user automatic AI response"
                className={`touch-target-chat-btn px-3 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer ${
                  isDarkMode
                    ? "bg-pink-500/10 hover:bg-pink-500 border-pink-500/20 text-pink-400 hover:text-white"
                    : "bg-pink-50 hover:bg-pink-600 border-pink-200 text-pink-600 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
                {aiLoading ? "Gemini Replying..." : "Simulate Response (AI)"}
              </button>
            </div>
          </div>

          {/* Messaging Area viewport */}
          <div
            ref={messageContainerRef}
            className="flex-1 p-4 overflow-y-auto space-y-3 font-sans"
            role="log"
            aria-live="polite"
            aria-label="Co-partner message log history"
          >
            {messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="w-full flex justify-center py-2"
                    role="note"
                  >
                    <div
                      className={`border text-[11px] leading-relaxed p-3 rounded-xl max-w-md text-center shadow-md font-mono ${
                        isDarkMode
                          ? "bg-gray-950/90 border-indigo-500/10 text-gray-350"
                          : "bg-slate-50 border-slate-200 text-slate-600"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              }

              const isMe = msg.senderId === activeUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  role="status"
                >
                  <div
                    className={`chat-message-item p-3 rounded-xl max-w-sm text-xs leading-relaxed ${
                      isMe
                        ? "bg-pink-600 text-white rounded-tr-none shadow-sm"
                        : isDarkMode
                          ? "bg-gray-850 text-gray-200 rounded-tl-none border border-gray-800"
                          : "bg-slate-100 text-slate-800 rounded-tl-none border border-slate-150"
                    }`}
                  >
                    <p
                      className={`font-mono text-[9px] mb-0.5 ${isMe ? "text-pink-200" : isDarkMode ? "text-zinc-400" : "text-slate-500"}`}
                    >
                      {msg.senderName}
                    </p>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    <span
                      className={`text-[9px] block text-right mt-1.5 font-mono ${isMe ? "text-pink-200" : isDarkMode ? "text-zinc-500" : "text-slate-400"}`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Global error or success mini alert widgets */}
          <div
            aria-live="assertive"
            aria-relevant="all"
            className="empty:hidden"
          >
            {(errorMsg || successMsg) && (
              <div
                className={`absolute bottom-18 left-4 right-4 z-50 p-2.5 text-[11px] rounded-lg border flex items-center justify-between gap-2 shadow-2xl ${
                  isDarkMode
                    ? "bg-gray-950 border-gray-850"
                    : "bg-white border-slate-200"
                }`}
                role="alert"
              >
                <span
                  className={errorMsg ? "text-rose-400" : "text-emerald-400"}
                >
                  {errorMsg || successMsg}
                </span>
                <button
                  onClick={() => {
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`cursor-pointer px-2 py-1 ${isDarkMode ? "text-gray-500 hover:text-white" : "text-slate-500 hover:text-slate-800"}`}
                  aria-label="Dismiss message alert"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className={`p-3 sm:p-4 border-t flex items-center gap-2 ${
              isDarkMode
                ? "border-gray-850/80 bg-gray-950/45"
                : "border-slate-100 bg-slate-50/50"
            }`}
            role="form"
            aria-label="Send live match coordination message"
          >
            <input
              type="text"
              required
              aria-required="true"
              aria-label="Message context"
              placeholder="Type message, coordinate meets, or share OTPs..."
              className={`touch-target-input flex-1 px-3 sm:px-4 py-2.5 border rounded-xl text-xs focus:border-pink-500 focus:outline-none ${
                isDarkMode
                  ? "bg-gray-900 border-gray-800 text-white"
                  : "bg-white border-slate-200 text-slate-900"
              }`}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button
              type="submit"
              aria-label="Submit message"
              className="touch-target-chat-btn p-3 bg-pink-600 hover:bg-pink-500 rounded-xl text-white transition active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      </div>

      {/* DISPUTE REASON MODAL POPUP */}
      {showDisputeModal && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dispute-title"
          aria-describedby="dispute-desc"
        >
          <div
            className={`border rounded-2xl max-w-md w-full p-6 space-y-4 shadow-3xl text-left ${
              isDarkMode
                ? "bg-gray-900 border-gray-800 text-white"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <div className="flex justify-between items-center">
              <h3
                id="dispute-title"
                className={`text-base font-bold font-display flex items-center gap-1.5 ${
                  isDarkMode ? "text-white" : "text-slate-900"
                }`}
              >
                <ShieldAlert
                  className="w-5 h-5 text-rose-500"
                  aria-hidden="true"
                />
                Submit Verification Dispute Claims
              </h3>
              <button
                onClick={() => setShowDisputeModal(false)}
                className={`cursor-pointer px-1 text-base ${isDarkMode ? "text-gray-400 hover:text-white" : "text-slate-400 hover:text-slate-800"}`}
                aria-label="Cancel and close dispute selection modal dialog"
              >
                ✕
              </button>
            </div>

            <p
              id="dispute-desc"
              className={`text-xs leading-relaxed ${isDarkMode ? "text-gray-440" : "text-slate-500"}`}
            >
              Escrow payment holds will be frozen completely under REVIEW
              status. Admin will study details to mediate refund arbitrations.
            </p>

            <form onSubmit={handleRaiseDispute} className="space-y-4">
              <div>
                <label
                  htmlFor="dispute-category-select"
                  className={`block text-[10px] font-bold font-mono mb-2 uppercase tracking-wider ${
                    isDarkMode ? "text-gray-300" : "text-slate-600"
                  }`}
                >
                  Select Primary Claim Fault Reason:
                </label>
                <select
                  id="dispute-category-select"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:border-pink-500 focus:outline-none ${
                    isDarkMode
                      ? "bg-gray-950 border-gray-850 text-white"
                      : "bg-white border-slate-250 text-slate-800"
                  }`}
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                >
                  <option value="">-- Choose Dispute Claim Reason --</option>
                  <option value="Duplicate Ticket: The scanner barcode said the ticket has already been used by someone else inside.">
                    Duplicate ticket (already scanned / used)
                  </option>
                  <option value="Invalid QR Code: The booking reference ticket code is fake or does not exist on BookMyShow/Paytm database.">
                    Fake booking confirmation code / invalid QR code
                  </option>
                  <option value="Wrong Seating/Theatre: ticket seats differ from Box Row F1 or movie name is wrong film entirely.">
                    Incorrect Theatre / Seating Box coords
                  </option>
                  <option value="Seller Fraud: The show commenced but the seller showed duplicate codes or spoofed confirmation codes.">
                    Seller fraud or physical misbehaviour at gate
                  </option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDisputeModal(false)}
                  className={`touch-target-chat-btn px-4 py-2 font-semibold rounded-lg text-xs cursor-pointer ${
                    isDarkMode
                      ? "bg-gray-800 hover:bg-gray-750 text-gray-300"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!disputeReason}
                  className="touch-target-chat-btn px-4 py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-bold cursor-pointer text-white"
                >
                  File Official Dispute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
