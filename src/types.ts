export interface Listing {
  id: string;
  movieName: string;
  theatreName: string;
  showTime: string;
  seatNumber: string;
  originalPrice: number;
  sellingPrice: number;
  screenshotUrl: string;
  description: string;
  sellerId: string;
  sellerName: string;
  status: 'AVAILABLE' | 'MATCH_REQUESTED' | 'MATCH_ACCEPTED' | 'CHAT_OPEN' | 'PAYMENT_PENDING' | 'MEETING_SCHEDULED' | 'OTP_PENDING' | 'DISPUTE_WINDOW' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED';
  createdAt: string;
}

export interface Transaction {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  mode: 'CONNECT' | 'SAFE';
  amountPaid: number;
  platformFee: number;
  status: 'PAYMENT_PENDING' | 'MATCH_REQUESTED' | 'MATCH_ACCEPTED' | 'CHAT_OPEN' | 'MEETING_SCHEDULED' | 'OTP_PENDING' | 'DISPUTE_WINDOW' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED' | 'REVIEW';
  buyerOtp: string;
  sellerOtp: string;
  buyerOtpEntered: boolean;
  sellerOtpEntered: boolean;
  matchTime?: string;
  otpTimestamp?: string;
  movieStartTime?: string;
  disputeReason?: string;
  disputeTimestamp?: string;
  reviewOutcome?: 'REFUNDED' | 'COMPLETED_TO_SELLER';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface WalletEntry {
  id: string;
  userId: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'PAYOUT';
  description: string;
  timestamp: string;
}

export interface Wallet {
  userId: string;
  balance: number;
  escrowBalance: number;
  totalPayouts: number;
  ledger: WalletEntry[];
}

export interface Persona {
  id: string;
  name: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar: string;
  email: string;
}
