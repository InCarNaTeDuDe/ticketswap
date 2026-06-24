import { Entity, PrimaryColumn, Column } from "typeorm";

@Entity("admin_configs")
export class AdminConfig {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column("double precision", { default: 10 })
  safeModeCommission!: number;
}
