import { BaseRepository } from "./BaseRepository.js";
import { User } from "../entities/User.js";

// Seeded users for demonstration and local offline testing
export const seedUsers: User[] = [
  {
    id: "user_maya",
    name: "Maya Sharma",
    email: "maya.sharma@example.com",
    mobileNumber: "9876543210",
    password: "password123",
    role: "seller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    createdAt: new Date()
  },
  {
    id: "user_raghu",
    name: "Raghu Raman",
    email: "raghu.raman@example.com",
    mobileNumber: "8765432109",
    password: "password123",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80",
    createdAt: new Date()
  },
  {
    id: "user_admin",
    name: "Admin Arbitrator",
    email: "admin@ticketswap.in",
    mobileNumber: "7654321098",
    password: "password123",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    createdAt: new Date()
  }
];

export class UserRepository extends BaseRepository<User> {
  private static instance: UserRepository;

  private constructor() {
    super(User, seedUsers, "id");
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  async getByMobile(mobileNumber: string): Promise<User | null> {
    return await this.findOneBy({ mobileNumber });
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.findOneBy({ email });
  }
}
