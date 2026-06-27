import "reflect-metadata";
import { DataSource } from "typeorm";
import { Listing } from "../entities/Listing.js";
import { Transaction } from "../entities/Transaction.js";
import { ChatMessage } from "../entities/ChatMessage.js";
import { Wallet } from "../entities/Wallet.js";
import { WalletEntry } from "../entities/WalletEntry.js";
import { AdminConfig } from "../entities/AdminConfig.js";
import { User } from "../entities/User.js";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_DATABASE || "ticketswap_db",
  synchronize: true, // Auto create/update schemas - ideal for development/applet environment
  logging: false,
  entities: [Listing, Transaction, ChatMessage, Wallet, WalletEntry, AdminConfig, User],
  subscribers: [],
  migrations: [],
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : undefined,
});

let isInitialized = false;

export async function initDatabase(): Promise<boolean> {
  if (isInitialized) return true;

  // --- DATABASE BYPASS OPTION FOR THE SANDBOX SIMULATOR ---
  // If your database tables are not set up yet, keep this set to true.
  // Set bypassDb to false when you have provisioned and verified your PostgreSQL db tables!
  const bypassDb = false; // Changed to false to allow real DB connection if host is configured, but fallback gracefully

  if (bypassDb) {
    console.warn("====================================================================");
    console.warn("📢 DATABASE CONNECTED: NO (Bypassed)");
    console.warn("👉 STATUS: Running in high-fidelity sandbox in-memory simulated persistence layer.");
    console.warn("====================================================================");
    return false;
  }

  // If there's no DB configuration, we can inform the user and skip crashing
  if (!process.env.DB_HOST) {
    console.warn("====================================================================");
    console.warn("📢 DATABASE CONNECTED: NO (DB_HOST environment variable not configured)");
    console.warn("👉 STATUS: Falling back to structured in-memory simulated persistence layer.");
    console.warn("====================================================================");
    return false;
  }

  try {
    await AppDataSource.initialize();
    isInitialized = true;
    console.log("====================================================================");
    console.log("🚀 DATABASE CONNECTED: YES");
    console.log("👉 STATUS: TypeORM PostgreSQL Database connected and synchronized successfully!");
    console.log("====================================================================");
    return true;
  } catch (error: any) {
    console.error("====================================================================");
    console.error("❌ DATABASE CONNECTED: NO (Initialization Failed)");
    console.error("👉 ERROR DETAILS:", error?.message || error);
    console.warn("👉 STATUS: Falling back to structured in-memory simulated persistence layer.");
    console.warn("====================================================================");
    return false;
  }
}
