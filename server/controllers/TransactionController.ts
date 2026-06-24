import { Request, Response } from "express";
import { TransactionService } from "../services/TransactionService.js";
import { ChatService } from "../services/ChatService.js";
import { AppDataSource } from "../config/database.js";
import { Transaction } from "../entities/Transaction.js";
import { ListingService } from "../services/ListingService.js";
import { createTransactionSchema, raiseDisputeSchema } from "../validators/schemas.js";

export class TransactionController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = createTransactionSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({ error: validationResult.error.issues[0].message });
        return;
      }
      const { listingId, buyerId, buyerName, mode } = validationResult.data;
      const data = await TransactionService.createTransaction(listingId, buyerId, buyerName, mode);
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async respond(req: Request, res: Response): Promise<void> {
    try {
      const { action, sellerId } = req.body;
      if (!action || !sellerId) {
        res.status(400).json({ error: "Missing action or sellerId" });
        return;
      }
      const data = await TransactionService.respondToTransaction(req.params.id, action, sellerId);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async timeout(req: Request, res: Response): Promise<void> {
    try {
      const data = await TransactionService.timeoutTransaction(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { otp, role, userId } = req.body;
      if (!otp || !role || !userId) {
        res.status(400).json({ error: "Missing required OTP parameters" });
        return;
      }
      const tx = await TransactionService.handleOtpVerification(req.params.id, otp, role, userId);
      res.json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async raiseDispute(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = raiseDisputeSchema.safeParse({
        id: req.params.id,
        ...req.body
      });
      if (!validationResult.success) {
        res.status(400).json({ error: validationResult.error.issues[0].message });
        return;
      }
      const { id, reason, userId, userName } = validationResult.data;
      const tx = await TransactionService.raiseDispute(id, reason, userId, userName);
      res.json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async settle(req: Request, res: Response): Promise<void> {
    try {
      const data = await TransactionService.settleTransaction(req.params.id);
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async cancel(req: Request, res: Response): Promise<void> {
    try {
      const { reason, userId } = req.body;
      const tx = await TransactionService.cancelTransaction(req.params.id, reason);
      res.json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getMessages(req: Request, res: Response): Promise<void> {
    try {
      const msgs = await ChatService.getMessagesByTransaction(req.params.id);
      res.json(msgs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async addMessage(req: Request, res: Response): Promise<void> {
    try {
      const { senderId, senderName, text } = req.body;
      if (!text || text.trim() === "") {
        res.status(450).json({ error: "Message cannot be empty" });
        return;
      }

      const tx = await TransactionService.getTransactionById(req.params.id);
      if (!tx) {
        res.status(444).json({ error: "Transaction not found" });
        return;
      }

      let sealConnection = false;
      if (tx.mode === 'CONNECT' && tx.status === 'CHAT_OPEN' && tx.sellerId === senderId) {
        // Direct transition
        tx.status = 'COMPLETED';
        if (AppDataSource.isInitialized) {
          const repo = AppDataSource.getRepository(Transaction);
          await repo.save(tx);
        }
        await ListingService.updateListingStatus(tx.listingId, 'COMPLETED');
        sealConnection = true;
      }

      const msg = await ChatService.addMessage(req.params.id, senderId, senderName, text, false);

      if (sealConnection) {
        await ChatService.addMessage(
          req.params.id, 
          "system", 
          "System Alert", 
          `🔒 First message sent by Seller! Platform role is now complete and ₹5 fee is sealed. Feel free to exchange phone numbers, meet offline, or coordinate. Safe exchanges!`,
          true
        );
      }

      const freshTx = await TransactionService.getTransactionById(req.params.id);
      res.status(201).json({ message: msg, transaction: freshTx });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
