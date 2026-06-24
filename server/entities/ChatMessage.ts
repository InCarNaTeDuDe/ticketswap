import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("chat_messages")
export class ChatMessage {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  transactionId!: string;

  @Column({ type: "varchar" })
  senderId!: string;

  @Column({ type: "varchar" })
  senderName!: string;

  @Column("text")
  text!: string;

  @Column({ type: "varchar" })
  timestamp!: string;

  @Column({ type: "boolean", default: false })
  isSystem?: boolean;
}
