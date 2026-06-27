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
    category: "TicketSwap",
    isTicketSwap: true,
    isDayMates: false,
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
    category: "TicketSwap",
    isTicketSwap: true,
    isDayMates: false,
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
    category: "TicketSwap",
    isTicketSwap: true,
    isDayMates: false,
    createdAt: new Date(),
  },
  {
    id: "list_4",
    movieName: "Fighter (Companion Hunt)",
    theatreName: "INOX Forum Mall, Bengaluru",
    showTime: new Date(Date.now() + 36 * 3600000).toISOString(),
    seatNumber: "K-14 (Adjacent to mine)",
    originalPrice: 350,
    sellingPrice: 0,
    screenshotUrl: "https://images.unsplash.com/photo-1478720143033-6a972678aa30?w=500&q=80",
    description: "Looking for an energetic movie companion to watch Fighter on Saturday! I already bought the ticket, so it's fully free for you. Let's hang out and watch this epic action movie together!",
    sellerId: "user_priya",
    sellerName: "Priya Patel",
    status: "AVAILABLE",
    category: "DayMates",
    isTicketSwap: false,
    isDayMates: true,
    createdAt: new Date(),
  },
  {
    id: "list_5",
    movieName: "Interstellar (IMAX Re-run)",
    theatreName: "Prasads IMAX, Hyderabad",
    showTime: new Date(Date.now() + 48 * 3600000).toISOString(),
    seatNumber: "N-18 & N-19",
    originalPrice: 400,
    sellingPrice: 200,
    screenshotUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    description: "Going for the classic Interstellar IMAX re-run on Sunday. I booked two adjacent tickets and want to split the cost with a fellow sci-fi enthusiast! Let's watch the masterpiece together.",
    sellerId: "user_maya",
    sellerName: "Maya Sharma",
    status: "AVAILABLE",
    category: "DayMates",
    isTicketSwap: false,
    isDayMates: true,
    createdAt: new Date(),
  },
  {
    id: "list_6",
    movieName: "Dune: Part Two (IMAX Hybrid)",
    theatreName: "PVR Director's Cut, Forum Mall Kormangala",
    showTime: new Date(Date.now() + 72 * 3600000).toISOString(),
    seatNumber: "G-8 & G-9",
    originalPrice: 600,
    sellingPrice: 300,
    screenshotUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&q=80",
    description: "I booked two tickets but my friend cancelled at the last minute. I am reselling the ticket at 50% discount (₹300) AND would love to watch it with a fellow film buff! Let's watch this sci-fi masterpiece together.",
    sellerId: "user_priya",
    sellerName: "Priya Patel",
    status: "AVAILABLE",
    category: "TicketSwap",
    isTicketSwap: true,
    isDayMates: true,
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
