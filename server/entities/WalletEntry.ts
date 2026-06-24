import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm";
import { Wallet } from "./Wallet.js";

@Entity("wallet_entries")
export class WalletEntry {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  userId!: string;

  @Column("double precision")
  amount!: number;

  @Column({ type: "varchar" })
  type!: 'CREDIT' | 'DEBIT' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'PAYOUT';

  @Column({ type: "varchar" })
  description!: string;

  @Column({ type: "varchar" })
  timestamp!: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.ledger, { onDelete: "CASCADE" })
  wallet!: Wallet;
}
