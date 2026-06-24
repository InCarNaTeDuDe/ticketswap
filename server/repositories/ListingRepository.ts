import { BaseRepository } from "./BaseRepository.js";
import { Listing } from "../entities/Listing.js";

const initialListings: Listing[] = [
  {
    id: "list_1",
    movieName: "Avengers: Doomsday",
    theatreName: "PVR Director's Cut, Ambience Mall",
    showTime: new Date(Date.now() + 2 * 3600000).toISOString(),
    seatNumber: "H-12, H-13 (Couple Seats)",
    originalPrice: 750,
    sellingPrice: 550,
    screenshotUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80",
    description: "Selling couple seats for the highly anticipated Avengers premiere tonight. Got an urgent meeting. Price negotiable but genuine buyers only please!",
    sellerId: "user_maya",
    sellerName: "Maya Sharma",
    status: "AVAILABLE",
    createdAt: new Date(),
  },
  {
    id: "list_2",
    movieName: "Pushpa 2: The Rule",
    theatreName: "Prasads Large Screen, Hyderabad",
    showTime: new Date(Date.now() + 1.5 * 3600000).toISOString(),
    seatNumber: "M-22",
    originalPrice: 295,
    sellingPrice: 200,
    screenshotUrl: "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=500&q=80",
    description: "Excellent seat view in the massive large screen at Prasads. Selling cheap since I had to travel out of town.",
    sellerId: "user_raghu",
    sellerName: "Raghu Raman",
    status: "AVAILABLE",
    createdAt: new Date(),
  },
  {
    id: "list_3",
    movieName: "Spider-Man: Beyond the Spider-Verse",
    theatreName: "INOX Insignia, Nehru Place",
    showTime: new Date(Date.now() + 24 * 3600000).toISOString(),
    seatNumber: "F-5",
    originalPrice: 420,
    sellingPrice: 300,
    screenshotUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    description: "Insignia premium ticket. Recliner seats. Includes meal voucher worth ₹100. Grab it fast!",
    sellerId: "user_maya",
    sellerName: "Maya Sharma",
    status: "AVAILABLE",
    createdAt: new Date(),
  }
];

export class ListingRepository extends BaseRepository<Listing> {
  private static instance: ListingRepository;

  private constructor() {
    super(Listing, initialListings, "id");
  }

  public static getInstance(): ListingRepository {
    if (!ListingRepository.instance) {
      ListingRepository.instance = new ListingRepository();
    }
    return ListingRepository.instance;
  }
}
