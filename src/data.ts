import { Persona } from './types';

export const SYSTEM_PERSONAS: Persona[] = [
  {
    id: "user_raghu",
    name: "Raghu Raman",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80",
    email: "raghu.raman@example.com"
  },
  {
    id: "user_maya",
    name: "Maya Sharma",
    role: "seller",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
    email: "maya.sharma@example.com"
  },
  {
    id: "user_priya",
    name: "Priya Patel",
    role: "seller",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80",
    email: "priya.patel@example.com"
  },
  {
    id: "user_admin",
    name: "System Administrator",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    email: "admin@ticketswap.in"
  }
];
