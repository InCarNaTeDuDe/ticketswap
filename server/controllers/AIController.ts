import { Request, Response } from "express";
import { TransactionService } from "../services/TransactionService.js";
import { ListingService } from "../services/ListingService.js";
import { ChatService } from "../services/ChatService.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API client initialized successfully in AIController.");
  } catch (error) {
    console.warn("Failed to initialize Gemini API client in AIController:", error);
  }
}

export class AIController {
  static async chatReply(req: Request, res: Response): Promise<void> {
    try {
      const { transactionId, activeRole } = req.body;
      const transaction = await TransactionService.getTransactionById(transactionId);
      if (!transaction) {
        res.status(404).json({ error: "Transaction not found" });
        return;
      }

      const listing = await ListingService.getListingById(transaction.listingId);
      if (!listing) {
        res.status(404).json({ error: "Associated ticket listing not found" });
        return;
      }

      // Gather past chats to inject as history
      const messages = await ChatService.getMessagesByTransaction(transactionId);
      const history = messages
        .map(m => `${m.senderName}: ${m.text}`)
        .join("\n");

      const aiName = activeRole === 'BUYER' ? transaction.sellerName : transaction.buyerName;
      const userPersona = activeRole === 'BUYER' ? 'Buyer' : 'Seller';
      const aiPersona = activeRole === 'BUYER' ? 'Seller' : 'Buyer';

      const systemInstructions = `
You are roleplaying as ${aiName}, a verified user on the TicketSwap platform.
Currently, you are in a transaction for the movie "${listing.movieName}" at "${listing.theatreName}" for physical ticket seats "${listing.seatNumber}".
Original Ticket price: ₹${listing.originalPrice}, Resale price: ₹${listing.sellingPrice}.

Transaction Mode: ${transaction.mode} Mode.
Security status: ${transaction.status}.
Your current role: ${aiPersona}.
The human user you are speaking with is the: ${userPersona}.

If you are a ${aiPersona} (Seller), you are eager to sell, coordinate a prompt physical handoff at the theatre doors, give details about the screening, and confirm you can show the digital QR.
If you are a ${aiPersona} (Buyer), you want to make sure the ticket is authentic and negotiate coordination or confirm the meet.
Keep your response short (1 or 2 conversational sentences), polite, relevant to coordinating meeting at the theatre doors, and highly realistic. Do not sound artificial. Be direct.
You can suggest sharing your OTP once you physically inspect or verify the ticket.
      `.trim();

      let replyText = "";

      if (ai) {
        try {
          const response = await ai.models.generateContent({
            model: "gemini-3.5-flash",
            contents: `
System context instruction: ${systemInstructions}

Current chat log:
${history}

Generate the next quick chat reply in Hindi-English conversational tone or casual English for ${aiName} (${aiPersona}):
            `,
          });
          replyText = response.text ? response.text.trim() : "";
        } catch (err) {
          console.error("Gemini API transaction chat reply failed:", err);
        }
      }

      // Fallback if Gemini failed / absent
      if (!replyText) {
        const fallbacks = [
          "I'm on my way near the main popcorn counter. Let me know when you reach!",
          "Yes, the seats are definitely genuine booking code. I can open the BookMyShow app to show you.",
          "Awesome, let's meet right outside Screen 3 ticket gate. I'll share my OTP with you once we verify.",
          "Just reached the theatre! Please let me know once you make the payment so we can exchange tickets.",
          "Perfect! Ready whenever you are."
        ];
        replyText = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      }

      const senderId = activeRole === 'BUYER' ? transaction.sellerId : transaction.buyerId;
      const aiMessage = await ChatService.addMessage(transactionId, senderId, aiName, replyText, false);

      res.json({ message: aiMessage });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
