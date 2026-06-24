import { Router } from "express";
import { ListingController } from "../controllers/ListingController.js";
import { TransactionController } from "../controllers/TransactionController.js";
import { WalletController } from "../controllers/WalletController.js";
import { AdminController } from "../controllers/AdminController.js";
import { AIController } from "../controllers/AIController.js";
import { AuthController } from "../controllers/AuthController.js";

const router = Router();

// ==================== API VERSION 1 ROUTES ====================

// --- Authentication Routes ---
router.post("/auth/request-otp", AuthController.requestOtp);
router.post("/auth/register", AuthController.register);
router.post("/auth/login-mobile", AuthController.loginWithMobile);
router.post("/auth/login-email", AuthController.loginWithEmail);
router.post("/auth/login-google", AuthController.loginWithGoogle);
router.get("/auth/google/url", AuthController.getGoogleAuthUrl);
router.get("/auth/google/callback", AuthController.handleGoogleCallback);
router.post("/auth/forgot-password", AuthController.forgotPassword);

// --- Listings Routes ---
router.get("/listings", ListingController.getAll);
router.post("/listings", ListingController.create);
router.get("/listings/:id", ListingController.getById);
router.delete("/listings/:id", ListingController.delete);

// --- Transactions / Safe Escrow Routes ---
router.post("/transactions", TransactionController.create);
router.post("/transactions/:id/respond", TransactionController.respond);
router.post("/transactions/:id/timeout", TransactionController.timeout);
router.post("/transactions/:id/otp", TransactionController.verifyOtp);
router.post("/transactions/:id/dispute", TransactionController.raiseDispute);
router.post("/transactions/:id/settle", TransactionController.settle);
router.post("/transactions/:id/cancel", TransactionController.cancel);

// --- Chat Messages Routes ---
router.get("/transactions/:id/messages", TransactionController.getMessages);
router.post("/transactions/:id/message", TransactionController.addMessage);

// --- Wallets Routes ---
router.get("/wallets/:userId", WalletController.getByUserId);
router.post("/wallets/:userId/refill", WalletController.refill);
router.post("/wallets/:userId/withdraw", WalletController.withdraw);

// --- Admin Features Routes ---
router.get("/admin/stats", AdminController.getStats);
router.post("/admin/config", AdminController.updateConfig);
router.post("/admin/resolve-dispute", AdminController.resolveDispute);

// --- AI Simulated Chats ---
router.post("/ai/chat-reply", AIController.chatReply);

export { router as v1Router };
