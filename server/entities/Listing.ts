import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("listings")
export class Listing {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  movieName!: string;

  @Column({ type: "varchar" })
  theatreName!: string;

  @Column({ type: "varchar" })
  showTime!: string;

  @Column({ type: "varchar" })
  seatNumber!: string;

  @Column("double precision")
  originalPrice!: number;

  @Column("double precision")
  sellingPrice!: number;

  @Column({ type: "varchar", default: "" })
  screenshotUrl!: string;

  @Column({ type: "varchar", default: "" })
  description!: string;

  @Column({ type: "varchar" })
  sellerId!: string;

  @Column({ type: "varchar" })
  sellerName!: string;

  @Column({ type: "varchar", default: "AVAILABLE" })
  status!: 'AVAILABLE' | 'MATCH_REQUESTED' | 'MATCH_ACCEPTED' | 'CHAT_OPEN' | 'PAYMENT_PENDING' | 'MEETING_SCHEDULED' | 'OTP_PENDING' | 'DISPUTE_WINDOW' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED' | 'DISPUTED';

  @CreateDateColumn()
  createdAt!: Date;
}
