import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("transactions")
export class Transaction {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  listingId!: string;

  @Column({ type: "varchar" })
  buyerId!: string;

  @Column({ type: "varchar" })
  buyerName!: string;

  @Column({ type: "varchar" })
  sellerId!: string;

  @Column({ type: "varchar" })
  sellerName!: string;

  @Column({ type: "varchar" })
  mode!: 'CONNECT' | 'SAFE';

  @Column("double precision")
  amountPaid!: number;

  @Column("double precision")
  platformFee!: number;

  @Column({ type: "varchar" })
  status!: 'PAYMENT_PENDING' | 'MATCH_REQUESTED' | 'MATCH_ACCEPTED' | 'CHAT_OPEN' | 'MEETING_SCHEDULED' | 'OTP_PENDING' | 'DISPUTE_WINDOW' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED' | 'REVIEW';

  @Column({ type: "varchar" })
  buyerOtp!: string;

  @Column({ type: "varchar" })
  sellerOtp!: string;

  @Column({ type: "boolean", default: false })
  buyerOtpEntered!: boolean;

  @Column({ type: "boolean", default: false })
  sellerOtpEntered!: boolean;

  @Column({ type: "varchar", nullable: true })
  matchTime?: string;

  @Column({ type: "varchar", nullable: true })
  otpTimestamp?: string;

  @Column({ type: "varchar", nullable: true })
  movieStartTime?: string;

  @Column({ type: "varchar", nullable: true })
  disputeReason?: string;

  @Column({ type: "varchar", nullable: true })
  disputeTimestamp?: string;

  @Column({ type: "varchar", nullable: true })
  reviewOutcome?: 'REFUNDED' | 'COMPLETED_TO_SELLER';

  @Column({ type: "varchar" })
  createdAt!: string;
}
