import { AppDataSource } from "../config/database.js";
import { ChatMessage } from "../entities/ChatMessage.js";

// In-memory fallback
let inMemoryMessages: ChatMessage[] = [];

export class ChatService {
  static async getMessagesByTransaction(transactionId: string): Promise<ChatMessage[]> {
    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(ChatMessage);
      return await repo.find({
        where: { transactionId },
        order: { timestamp: "ASC" }
      });
    }
    return inMemoryMessages.filter(msg => msg.transactionId === transactionId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  static async addMessage(
    transactionId: string,
    senderId: string,
    senderName: string,
    text: string,
    isSystem = false
  ): Promise<ChatMessage> {
    const newMessage = new ChatMessage();
    newMessage.id = `msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    newMessage.transactionId = transactionId;
    newMessage.senderId = senderId;
    newMessage.senderName = senderName;
    newMessage.text = text;
    newMessage.timestamp = new Date().toISOString();
    newMessage.isSystem = isSystem;

    if (AppDataSource.isInitialized) {
      const repo = AppDataSource.getRepository(ChatMessage);
      return await repo.save(newMessage);
    } else {
      inMemoryMessages.push(newMessage);
      return newMessage;
    }
  }
}
