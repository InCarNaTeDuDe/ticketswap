import { Request, Response } from "express";
import { WalletService } from "../services/WalletService.js";

export class WalletController {
  static async getByUserId(req: Request, res: Response): Promise<void> {
    try {
      const wallet = await WalletService.getOrCreateWallet(req.params.userId);
      res.json(wallet);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to retrieve wallet" });
    }
  }

  static async refill(req: Request, res: Response): Promise<void> {
    try {
      const { amount } = req.body;
      if (amount === undefined || Number(amount) <= 0) {
        res.status(400).json({ error: "Amount must be greater than 0" });
        return;
      }
      const wallet = await WalletService.refillWallet(req.params.userId, Number(amount));
      res.json(wallet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const { amount } = req.body;
      if (amount === undefined || Number(amount) <= 0) {
        res.status(400).json({ error: "Amount must be greater than 0" });
        return;
      }
      const outcome = await WalletService.withdrawWallet(req.params.userId, Number(amount));
      if (!outcome.success) {
        res.status(400).json({ error: outcome.error });
        return;
      }
      res.json(outcome.wallet);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
