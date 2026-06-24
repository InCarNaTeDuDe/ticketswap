import { AppDataSource } from "../config/database.js";
import { Wallet } from "../entities/Wallet.js";
import { WalletEntry } from "../entities/WalletEntry.js";

// In-memory fallback dataset
const inMemoryWallets: Record<string, Wallet> = {};

// Direct helper to initialize in-memory admin wallet
function seedInMemoryAdmin() {
  if (!inMemoryWallets["user_admin"]) {
    const adminWallet = new Wallet();
    adminWallet.userId = "user_admin";
    adminWallet.balance = 1000;
    adminWallet.escrowBalance = 0;
    adminWallet.totalPayouts = 0;
    adminWallet.ledger = [];

    const entry = new WalletEntry();
    entry.id = "w_admin_init";
    entry.userId = "user_admin";
    entry.amount = 1000;
    entry.type = "CREDIT";
    entry.description = "Initial platform collected revenue";
    entry.timestamp = new Date().toISOString();
    entry.wallet = adminWallet;

    adminWallet.ledger.push(entry);
    inMemoryWallets["user_admin"] = adminWallet;
  }
}
seedInMemoryAdmin();

export class WalletService {
  static async getOrCreateWallet(userId: string): Promise<Wallet> {
    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      const ledgerRepo = AppDataSource.getRepository(WalletEntry);

      let wallet = await walletRepo.findOne({
        where: { userId },
        relations: { ledger: true },
      });

      if (!wallet) {
        // Pre-funded wallet logic for simple sandbox convenience (₹500 for demo)
        const initialFunds = userId === "user_admin" ? 1000 : 500;
        const initialDescription = userId === "user_admin" 
          ? "Initial platform collected revenue" 
          : "Demo wallet pre-funded with welcome balance";

        wallet = new Wallet();
        wallet.userId = userId;
        wallet.balance = initialFunds;
        wallet.escrowBalance = 0;
        wallet.totalPayouts = 0;
        wallet.ledger = [];

        await walletRepo.save(wallet);

        const entry = new WalletEntry();
        entry.id = `w_init_${userId}_${Date.now()}`;
        entry.userId = userId;
        entry.amount = initialFunds;
        entry.type = "CREDIT";
        entry.description = initialDescription;
        entry.timestamp = new Date().toISOString();
        entry.wallet = wallet;

        await ledgerRepo.save(entry);
        wallet.ledger.push(entry);
      }

      // Sort entries by timestamp desc
      if (wallet.ledger) {
        wallet.ledger.sort((a, b) => b.id.localeCompare(a.id));
      }

      return wallet;
    } else {
      seedInMemoryAdmin();
      if (!inMemoryWallets[userId]) {
        const wallet = new Wallet();
        wallet.userId = userId;
        wallet.balance = 500;
        wallet.escrowBalance = 0;
        wallet.totalPayouts = 0;
        wallet.ledger = [];

        const entry = new WalletEntry();
        entry.id = `w_init_${userId}_${Date.now()}`;
        entry.userId = userId;
        entry.amount = 500;
        entry.type = "CREDIT";
        entry.description = "Demo wallet pre-funded with welcome balance";
        entry.timestamp = new Date().toISOString();
        entry.wallet = wallet;

        wallet.ledger.push(entry);
        inMemoryWallets[userId] = wallet;
      }
      return inMemoryWallets[userId];
    }
  }

  static async addLedgerEntry(
    userId: string, 
    amount: number, 
    type: WalletEntry["type"], 
    description: string
  ): Promise<WalletEntry> {
    const parentWallet = await this.getOrCreateWallet(userId);

    const entry = new WalletEntry();
    entry.id = `tx_entry_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    entry.userId = userId;
    entry.amount = amount;
    entry.type = type;
    entry.description = description;
    entry.timestamp = new Date().toISOString();
    entry.wallet = parentWallet;

    if (AppDataSource.isInitialized) {
      const entryRepo = AppDataSource.getRepository(WalletEntry);
      const resEntry = await entryRepo.save(entry);
      
      // Update local array for immediate return
      if (!parentWallet.ledger) parentWallet.ledger = [];
      parentWallet.ledger.push(resEntry);
      return resEntry;
    } else {
      if (!parentWallet.ledger) parentWallet.ledger = [];
      parentWallet.ledger.push(entry);
      return entry;
    }
  }

  static async refillWallet(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += amount;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }

    await this.addLedgerEntry(
      userId, 
      amount, 
      "CREDIT", 
      `Wallet Refill - Added funds successfully`
    );

    return wallet;
  }

  static async withdrawWallet(userId: string, amount: number): Promise<{ success: boolean; wallet?: Wallet; error?: string }> {
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) {
      return { success: false, error: "Insufficient balance for withdrawal" };
    }

    wallet.balance -= amount;
    wallet.totalPayouts += amount;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }

    await this.addLedgerEntry(
      userId, 
      -amount, 
      "PAYOUT", 
      `Withdrew funds to bank account`
    );

    return { success: true, wallet };
  }

  static async handleEscrowHold(userId: string, amount: number, description: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance -= amount;
    wallet.escrowBalance += amount;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }

    await this.addLedgerEntry(userId, -amount, "ESCROW_HOLD", description);
    return wallet;
  }

  static async handleEscrowRelease(userId: string, amount: number, description: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.escrowBalance -= amount;
    // Release proceeds or refund
    wallet.balance += amount;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }

    await this.addLedgerEntry(userId, amount, "ESCROW_RELEASE", description);
    return wallet;
  }

  static async handleEscrowDirectDebitFee(userId: string, amount: number, description: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance -= amount;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }

    await this.addLedgerEntry(userId, -amount, "DEBIT", description);
    return wallet;
  }

  static async updateBalanceDirectly(userId: string, balanceChange: number): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    wallet.balance += balanceChange;

    if (AppDataSource.isInitialized) {
      const walletRepo = AppDataSource.getRepository(Wallet);
      await walletRepo.save(wallet);
    }
    return wallet;
  }
}
