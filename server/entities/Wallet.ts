import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { WalletEntry } from "./WalletEntry.js";

@Entity("wallets")
export class Wallet {
  @PrimaryColumn({ type: "varchar" })
  userId!: string;

  @Column("double precision", { default: 500 })
  balance!: number;

  @Column("double precision", { default: 0 })
  escrowBalance!: number;

  @Column("double precision", { default: 0 })
  totalPayouts!: number;

  @OneToMany(() => WalletEntry, (entry) => entry.wallet, { cascade: true })
  ledger!: WalletEntry[];
}
