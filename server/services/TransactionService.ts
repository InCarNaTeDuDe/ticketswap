import { AppDataSource } from "../config/database.js";
import { Transaction } from "../entities/Transaction.js";
import { Wallet } from "../entities/Wallet.js";
import { ListingService } from "./ListingService.js";
import { WalletService } from "./WalletService.js";
import { ChatService } from "./ChatService.js";
import { AdminService } from "./AdminService.js";

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let inMemoryTransactions: Transaction[] = [];

export class TransactionService {
  static async getAllTransactions(): Promise<Transaction[]> {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      return await repo.find();
    }
    return inMemoryTransactions;
  }

  static async getTransactionById(id: string): Promise<Transaction | null> {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      return await repo.findOneBy({ id });
    }
    return inMemoryTransactions.find(t => t.id === id) || null;
  }

  static async createTransaction(
    listingId: string, 
    buyerId: string, 
    buyerName: string, 
    mode: 'CONNECT' | 'SAFE'
  ): Promise<{ transaction: Transaction; buyerWallet: any }> {
    const listing = await ListingService.getListingById(listingId);
    if (!listing) throw new Error("Listing not found");
    if (listing.status !== "AVAILABLE") throw new Error("Listing is no longer available");

    const buyerWallet = await WalletService.getOrCreateWallet(buyerId);
    const safeCommission = await AdminService.getSafeModeCommission();
    const platformFee = mode === 'CONNECT' ? 5 : safeCommission;
    const totalCost = mode === 'CONNECT' ? 5 : listing.sellingPrice + platformFee;

    if (buyerWallet.balance < totalCost) {
      throw new Error(`Insufficient balance! You need ₹${totalCost}, but only have ₹${buyerWallet.balance}. Use the Refill button in the Wallet tab.`);
    }

    // Process escrow holding or debit
    if (mode === 'SAFE') {
      await WalletService.handleEscrowHold(
        buyerId, 
        totalCost, 
        `Paid for Ticket Swap - ${listing.movieName} (Safe Mode Escrow hold)`
      );
    } else {
      await WalletService.handleEscrowDirectDebitFee(
        buyerId, 
        5, 
        `Paid for Ticket Swap - ${listing.movieName} (Connect Mode flat fee)`
      );
      
      // Send platform fee directly to user_admin
      await WalletService.updateBalanceDirectly("user_admin", 5);
      await WalletService.addLedgerEntry(
        "user_admin", 
        5, 
        "CREDIT", 
        `Connect platform fee collected from ${buyerName} for movie ID ${listing.id}`
      );
    }

    const buyerOtp = generateOTP();
    const sellerOtp = generateOTP();

    const transaction = new Transaction();
    transaction.id = `tx_${Date.now()}`;
    transaction.listingId = listingId;
    transaction.buyerId = buyerId;
    transaction.buyerName = buyerName;
    transaction.sellerId = listing.sellerId;
    transaction.sellerName = listing.sellerName;
    transaction.mode = mode;
    transaction.amountPaid = totalCost;
    transaction.platformFee = platformFee;
    transaction.status = 'MATCH_REQUESTED';
    transaction.buyerOtp = buyerOtp;
    transaction.sellerOtp = sellerOtp;
    transaction.buyerOtpEntered = false;
    transaction.sellerOtpEntered = false;
    transaction.createdAt = new Date().toISOString();

    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    } else {
      inMemoryTransactions.push(transaction);
    }

    await ListingService.updateListingStatus(listingId, 'MATCH_REQUESTED');

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `System Alert: 🎟️ ${buyerName} requested to ${mode === 'CONNECT' ? 'connect' : 'buy securely'}! Waiting for Seller ${listing.sellerName} to accept or reject. ${mode === 'CONNECT' ? 'Note: Seller must respond within 10 minutes.' : ''}`,
      true
    );

    const freshBuyerWallet = await WalletService.getOrCreateWallet(buyerId);
    return { transaction, buyerWallet: freshBuyerWallet };
  }

  static async respondToTransaction(
    id: string, 
    action: 'ACCEPT' | 'REJECT', 
    sellerId: string
  ): Promise<{ transaction: Transaction; listing: any }> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.sellerId !== sellerId) throw new Error("Unauthorized response");

    const listing = await ListingService.getListingById(transaction.listingId);

    if (action === 'REJECT') {
      transaction.status = 'CANCELLED';
      if (AppDataSource.isInitialized) {
        const repo = AppDataSource.getRepository(Transaction);
        await repo.save(transaction);
      }

      if (listing) {
        await ListingService.updateListingStatus(listing.id, 'AVAILABLE');
      }

      // Refund buyer
      if (transaction.mode === 'SAFE') {
        await WalletService.handleEscrowRelease(
          transaction.buyerId, 
          transaction.amountPaid, 
          `Refunded for ${listing ? listing.movieName : "Ticket"} - Resale request rejected by seller.`
        );
      } else {
        await WalletService.updateBalanceDirectly(transaction.buyerId, transaction.amountPaid);
        await WalletService.addLedgerEntry(
          transaction.buyerId, 
          transaction.amountPaid, 
          'CREDIT', 
          `Refunded for ${listing ? listing.movieName : "Ticket"}.`
        );
        // Deduct from admin wallet because connect fee is rejected
        await WalletService.updateBalanceDirectly("user_admin", -5);
      }

      await ChatService.addMessage(
        transaction.id, 
        "system", 
        "System Alert", 
        `❌ Seller rejected the request. Ticket holds have been cancelled, and ₹${transaction.amountPaid} has been refunded to the buyer's wallet.`,
        true
      );
    } else {
      transaction.matchTime = new Date().toISOString();
      if (transaction.mode === 'CONNECT') {
        transaction.status = 'CHAT_OPEN';
        if (listing) {
          await ListingService.updateListingStatus(listing.id, 'CHAT_OPEN');
        }

        await ChatService.addMessage(
          transaction.id, 
          "system", 
          "System Alert", 
          `✅ ${transaction.sellerName} accepted your request! Connect Mode active. Seller must send a message to unlock chat and finalize connection escrow.`,
          true
        );
      } else {
        transaction.status = 'MEETING_SCHEDULED';
        if (listing) {
          await ListingService.updateListingStatus(listing.id, 'MEETING_SCHEDULED');
        }

        await ChatService.addMessage(
          transaction.id, 
          "system", 
          "System Alert", 
          `🤝 Safe Mode Activated! Meeting spot booked: Theatre entrance of "${listing ? listing.theatreName : 'Venue'}". Coordinate details below, inspect the ticket QR, and enter OTP code to release escrow.`,
          true
        );
      }

      if (AppDataSource.isInitialized) {
        const repo = AppDataSource.getRepository(Transaction);
        await repo.save(transaction);
      }
    }

    const updatedListing = await ListingService.getListingById(transaction.listingId);
    return { transaction, listing: updatedListing };
  }

  static async timeoutTransaction(id: string): Promise<{ transaction: Transaction; buyerWallet: any }> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== 'MATCH_REQUESTED') throw new Error("Transaction is not in waiting state.");

    transaction.status = 'CANCELLED';
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    }

    await ListingService.updateListingStatus(transaction.listingId, 'AVAILABLE');

    // Refund ₹5 to buyer
    await WalletService.updateBalanceDirectly(transaction.buyerId, transaction.amountPaid);
    await WalletService.addLedgerEntry(
      transaction.buyerId, 
      transaction.amountPaid, 
      'CREDIT', 
      `Refunded Connect platform fee (10 min timeout reached)`
    );

    // Deduct from Admin
    await WalletService.updateBalanceDirectly("user_admin", -5);

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `⏳ Checkout expired. Seller did not respond within the 10-minute seller-reply window. ₹5 has been successfully refunded to the buyer.`,
      true
    );

    const freshWallet = await WalletService.getOrCreateWallet(transaction.buyerId);
    return { transaction, buyerWallet: freshWallet };
  }

  static async handleOtpVerification(
    id: string, 
    otp: string, 
    role: 'BUYER_INPUT_SELLER_OTP' | 'SELLER_INPUT_BUYER_OTP', 
    userId: string
  ): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");

    if (role === 'BUYER_INPUT_SELLER_OTP') {
      if (otp === transaction.sellerOtp) {
        transaction.sellerOtpEntered = true;
      } else {
        throw new Error("Incorrect Seller OTP!");
      }
    } else if (role === 'SELLER_INPUT_BUYER_OTP') {
      if (otp === transaction.buyerOtp) {
        transaction.buyerOtpEntered = true;
      } else {
        throw new Error("Incorrect Buyer OTP!");
      }
    } else {
      throw new Error("Invalid role action");
    }

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `验证 / OTP Verification: ${role === 'BUYER_INPUT_SELLER_OTP' ? 'Buyer has successfully verified Seller’s ticket presence VPS.' : 'Seller has validated Buyer’s location security.'}`,
      true
    );

    if (transaction.buyerOtpEntered && transaction.sellerOtpEntered) {
      transaction.status = 'DISPUTE_WINDOW';
      transaction.otpTimestamp = new Date().toISOString();
      transaction.movieStartTime = new Date().toISOString();

      await ListingService.updateListingStatus(transaction.listingId, 'DISPUTE_WINDOW');

      await ChatService.addMessage(
        transaction.id, 
        "system", 
        "System Alert", 
        `🔐 Both OTPs exchanged! Meeting & ticket inspection COMPLETED. Funds held in PENDING_SETTLEMENT. 60-minutes Dispute Window starts now (simulate elapsed time in dispute tab).`,
        true
      );
    }

    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    }

    return transaction;
  }

  static async raiseDispute(
    id: string, 
    reason: string, 
    userId: string, 
    userName: string
  ): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== 'DISPUTE_WINDOW') {
      throw new Error("Dispute can only be filed during the active 60-minute window.");
    }

    transaction.status = 'REVIEW';
    transaction.disputeReason = reason;
    transaction.disputeTimestamp = new Date().toISOString();

    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    }

    await ListingService.updateListingStatus(transaction.listingId, 'DISPUTED');

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `⚠️ DISPUTE RAISED by Buyer (${userName}): "${reason}". Funds have been frozen. Admin will review ticket ticket validities and arbitrate.`,
      true
    );

    return transaction;
  }

  static async settleTransaction(id: string): Promise<{ transaction: Transaction; sellerWallet: any }> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");
    if (transaction.status !== 'DISPUTE_WINDOW') {
      throw new Error("Transaction is not in pending settlement state.");
    }

    const listing = await ListingService.getListingById(transaction.listingId);
    const ticketVal = listing ? listing.sellingPrice : 0;
    const baseReward = ticketVal;
    const buyerEscrowTotal = transaction.amountPaid;
    const commission = transaction.platformFee;

    transaction.status = 'COMPLETED';
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    }

    if (listing) {
      await ListingService.updateListingStatus(listing.id, 'COMPLETED');
    }

    // Deduct escrow from buyer
    const buyerWallet = await WalletService.getOrCreateWallet(transaction.buyerId);
    buyerWallet.escrowBalance -= buyerEscrowTotal;
    if (AppDataSource.isInitialized) {
      const wRepo = AppDataSource.getRepository(Wallet);
      await wRepo.save(buyerWallet);
    }

    // Pay Seller
    await WalletService.updateBalanceDirectly(transaction.sellerId, baseReward);
    await WalletService.addLedgerEntry(
      transaction.sellerId, 
      baseReward, 
      'CREDIT', 
      `Safe Mode sale complete! Payout released for ${listing ? listing.movieName : "Ticket"}`
    );

    // Pay Admin Commission
    await WalletService.updateBalanceDirectly("user_admin", commission);
    await WalletService.addLedgerEntry(
      "user_admin", 
      commission, 
      'CREDIT', 
      `Platform safe escrow commission from transaction ${transaction.id}`
    );

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `🎉 Settlement resolved! ₹${baseReward} paid directly to Seller ${transaction.sellerName}. Platform fee of ₹${commission} collected. Thank you for swapping securely!`,
      true
    );

    const freshSellerWallet = await WalletService.getOrCreateWallet(transaction.sellerId);
    return { transaction, sellerWallet: freshSellerWallet };
  }

  static async cancelTransaction(id: string, reason: string): Promise<Transaction> {
    const transaction = await this.getTransactionById(id);
    if (!transaction) throw new Error("Transaction not found");

    const listing = await ListingService.getListingById(transaction.listingId);
    transaction.status = 'CANCELLED';

    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(Transaction);
      await repo.save(transaction);
    }

    if (listing) {
      await ListingService.updateListingStatus(listing.id, 'AVAILABLE');
    }

    if (transaction.mode === 'SAFE') {
      const buyerWallet = await WalletService.getOrCreateWallet(transaction.buyerId);
      buyerWallet.balance += transaction.amountPaid;
      buyerWallet.escrowBalance -= transaction.amountPaid;

      if (AppDataSource.isInitialized) {
        const wRepo = AppDataSource.getRepository(Wallet);
        await wRepo.save(buyerWallet);
      }

      await WalletService.addLedgerEntry(
        transaction.buyerId, 
        transaction.amountPaid, 
        'CREDIT', 
        `Safe mode transaction cancelled: Buyer rejected inspection / Cancelled before swap.`
      );
    } else {
      // Connect mode cancel refund ₹5
      await WalletService.updateBalanceDirectly(transaction.buyerId, transaction.amountPaid);
      await WalletService.addLedgerEntry(
        transaction.buyerId, 
        transaction.amountPaid, 
        'CREDIT', 
        `Connect mode cancelled context refund.`
      );
      await WalletService.updateBalanceDirectly("user_admin", -5);
    }

    await ChatService.addMessage(
      transaction.id, 
      "system", 
      "System Alert", 
      `🚫 Transaction cancelled. Reason: ${reason || "Negotiations failed during inspection."}. Refund issued in full. Ticket is back on market.`,
      true
    );

    return transaction;
  }
}
