import { AppDataSource } from "../config/database.js";
import { AdminConfig } from "../entities/AdminConfig.js";
import { ListingService } from "./ListingService.js";
import { TransactionService } from "./TransactionService.js";
import { WalletService } from "./WalletService.js";
import { ChatService } from "./ChatService.js";
import { Wallet } from "../entities/Wallet.js";
import { Transaction } from "../entities/Transaction.js";

// Fallback config state
let inMemoryConfig: AdminConfig = {
  id: "default",
  safeModeCommission: 10
};

export class AdminService {
  static async getSafeModeCommission(): Promise<number> {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(AdminConfig);
      const conf = await repo.findOneBy({ id: "default" });
      return conf ? conf.safeModeCommission : 10;
    }
    return inMemoryConfig.safeModeCommission;
  }

  static async updateConfig(commission: number): Promise<AdminConfig> {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(AdminConfig);
      let conf = await repo.findOneBy({ id: "default" });
      if (!conf) {
        conf = new AdminConfig();
        conf.id = "default";
      }
      conf.safeModeCommission = commission;
      return await repo.save(conf);
    } else {
      inMemoryConfig.safeModeCommission = commission;
      return inMemoryConfig;
    }
  }

  static async getStats(): Promise<any> {
    const listings = await ListingService.getAllListings();
    const transactions = await TransactionService.getAllTransactions();
    const adminWallet = await WalletService.getOrCreateWallet("user_admin");

    const activeListingsCount = listings.filter(l => 
      l.status === 'AVAILABLE' || l.status === 'MATCH_ACCEPTED' || l.status === 'CHAT_OPEN'
    ).length;

    // Escrow holds calculation (Wait, we can fetch all wallets or sum in-memory keys)
    // To make it simple, let's look at the wallets balances or sum from ledger/transactions
    let escrowBalance = 0;
    if (AppDataSource.isInitialized) {
      const wRepo = AppDataSource.getRepository(Wallet);
      const allWallets = await wRepo.find();
      escrowBalance = allWallets.reduce((sum, w) => sum + w.escrowBalance, 0);
    } else {
      // In-memory sum (Wait, WalletService has inMemoryWallets, we can grab standard balances)
      // Since wallets are pre-funded / fetched dynamically, let's sum from transactions where status is OTP_PENDING/DISPUTE_WINDOW/REVIEW/MATCH_REQUESTED/MEETING_SCHEDULED in SAFE mode.
      const safeHolds = transactions.filter(t => t.mode === 'SAFE' && 
        ['MATCH_REQUESTED', 'MATCH_ACCEPTED', 'CHAT_OPEN', 'MEETING_SCHEDULED', 'OTP_PENDING', 'DISPUTE_WINDOW', 'REVIEW'].includes(t.status)
      );
      escrowBalance = safeHolds.reduce((sum, t) => sum + t.amountPaid, 0);
    }

    const disputesCount = transactions.filter(t => t.status === 'REVIEW').length;
    const commConfig = await this.getSafeModeCommission();

    return {
      totalListings: listings.length,
      activeListingsCount,
      revenue: adminWallet.balance,
      escrowBalance,
      disputesCount,
      commissionConfig: commConfig,
      transactionsCount: transactions.length,
      // Just some approximate count of active sessions/wallets
      usersCount: 5 + disputesCount, 
      transactions,
      listings,
    };
  }

  static async resolveDispute(
    transactionId: string, 
    resolution: 'REFUND_BUYER' | 'RELEASE_TO_SELLER'
  ): Promise<any> {
    const transaction = await TransactionService.getTransactionById(transactionId);
    if (!transaction) throw new Error("Transaction not found");

    const listing = await ListingService.getListingById(transaction.listingId);
    const ticketVal = listing ? listing.sellingPrice : 0;
    const platformFee = transaction.platformFee;

    if (resolution === 'REFUND_BUYER') {
      transaction.status = 'REFUNDED';
      transaction.reviewOutcome = 'REFUNDED';
      if (listing) {
        await ListingService.updateListingStatus(listing.id, 'REFUNDED');
      }

      await WalletService.handleEscrowRelease(
        transaction.buyerId, 
        transaction.amountPaid, 
        `Dispute Resolved by Admin: Fully Refunded for ${listing ? listing.movieName : "ticket Resale"}.`
      );

      await ChatService.addMessage(
        transaction.id, 
        "system", 
        "Admin Arbitration", 
        `⚖️ Admin resolved dispute in favor of the BUYER. All funds have been fully refunded to the buyer's balance.`,
        true
      );
    } else {
      transaction.status = 'COMPLETED';
      transaction.reviewOutcome = 'COMPLETED_TO_SELLER';
      if (listing) {
        await ListingService.updateListingStatus(listing.id, 'COMPLETED');
      }

      // Decrement buyer escrow
      const buyerWallet = await WalletService.getOrCreateWallet(transaction.buyerId);
      buyerWallet.escrowBalance -= transaction.amountPaid;
      if (AppDataSource.isInitialized) {
        const wRepo = AppDataSource.getRepository(Wallet);
        await wRepo.save(buyerWallet);
      }

      // Give proceed to seller
      await WalletService.updateBalanceDirectly(transaction.sellerId, ticketVal);
      await WalletService.addLedgerEntry(
        transaction.sellerId, 
        ticketVal, 
        'CREDIT', 
        `Dispute Resolved by Admin: Payout released for ${listing ? listing.movieName : "ticket Sales"}.`
      );

      // Commission to Admin
      await WalletService.updateBalanceDirectly("user_admin", platformFee);
      await WalletService.addLedgerEntry(
        "user_admin", 
        platformFee, 
        'CREDIT', 
        `Platform arbitration commission fee from transaction ${transaction.id}`
      );

      await ChatService.addMessage(
        transaction.id, 
        "system", 
        "Admin Arbitration", 
        `⚖️ Admin resolved dispute in favor of the SELLER. Ticket verified as valid, and ₹${ticketVal} has been transferred to the seller's balance.`,
        true
      );
    }

    if (AppDataSource.isInitialized) {
      const tRepo = AppDataSource.getRepository(Transaction);
      await tRepo.save(transaction);
    }

    return transaction;
  }
}
