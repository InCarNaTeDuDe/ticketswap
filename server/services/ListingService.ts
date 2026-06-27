import { Listing } from "../entities/Listing.js";
import { ListingRepository } from "../repositories/ListingRepository.js";

const repo = ListingRepository.getInstance();

export class ListingService {
  static async getAllListings(): Promise<Listing[]> {
    return await repo.find({ order: { createdAt: "DESC" } });
  }

  static async getListingById(id: string): Promise<Listing | null> {
    return await repo.findOneBy({ id });
  }

  static async createListing(data: Partial<Listing>): Promise<Listing> {
    const newListing = new Listing();
    newListing.id = data.id || `list_${Date.now()}`;
    newListing.movieName = data.movieName!;
    newListing.theatreName = data.theatreName!;
    newListing.showTime = data.showTime!;
    newListing.seatNumber = data.seatNumber!;
    newListing.originalPrice = Number(data.originalPrice);
    newListing.sellingPrice = Number(data.sellingPrice);
    newListing.screenshotUrl = data.screenshotUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
    newListing.description = data.description || "No additional description provided.";
    newListing.sellerId = data.sellerId!;
    newListing.sellerName = data.sellerName!;
    newListing.status = "AVAILABLE";
    newListing.category = data.category || "TicketSwap";
    newListing.isTicketSwap = data.isTicketSwap !== undefined ? data.isTicketSwap : true;
    newListing.isDayMates = data.isDayMates !== undefined ? data.isDayMates : false;
    newListing.createdAt = new Date();

    return await repo.save(newListing);
  }

  static async deleteListing(id: string): Promise<boolean> {
    return await repo.delete(id);
  }

  static async updateListingStatus(id: string, status: Listing["status"]): Promise<Listing | null> {
    const listing = await repo.findOneBy({ id });
    if (listing) {
      listing.status = status;
      return await repo.save(listing);
    }
    return null;
  }
}
