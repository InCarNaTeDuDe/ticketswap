import { Request, Response } from "express";
import { ListingService } from "../services/ListingService.js";
import { createListingSchema } from "../validators/schemas.js";

export class ListingController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const listings = await ListingService.getAllListings();
      res.json(listings);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch listings" });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const listing = await ListingService.getListingById(req.params.id);
      if (!listing) {
        res.status(404).json({ error: "Listing not found" });
        return;
      }
      res.json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch listing" });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const validationResult = createListingSchema.safeParse({
        ...req.body,
        originalPrice: Number(req.body.originalPrice),
        sellingPrice: Number(req.body.sellingPrice),
      });

      if (!validationResult.success) {
        res.status(400).json({ error: validationResult.error.issues[0].message });
        return;
      }

      const listing = await ListingService.createListing(validationResult.data);
      res.status(201).json(listing);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to create listing" });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const deleted = await ListingService.deleteListing(req.params.id);
      res.json({ success: deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to delete listing" });
    }
  }
}
