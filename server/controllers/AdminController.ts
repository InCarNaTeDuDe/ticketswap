import { Request, Response } from "express";
import { AdminService } from "../services/AdminService.js";

export class AdminController {
  static async getStats(req: Request, res: Response): Promise<void> {
    try {
      const stats = await AdminService.getStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  static async updateConfig(req: Request, res: Response): Promise<void> {
    try {
      const { safeModeCommission } = req.body;
      if (safeModeCommission === undefined || Number(safeModeCommission) < 0) {
        res.status(400).json({ error: "Safe mode commission configuration must be non-negative" });
        return;
      }
      const config = await AdminService.updateConfig(Number(safeModeCommission));
      res.json(config);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async resolveDispute(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, resolution } = req.body;
      if (!transactionId || !resolution) {
        res.status(400).json({ error: "Missing transactionId or resolution parameters" });
        return;
      }
      const tx = await AdminService.resolveDispute(transactionId, resolution);
      res.json(tx);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
