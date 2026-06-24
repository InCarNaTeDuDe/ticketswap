import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "varchar" })
  name!: string;

  @Column({ type: "varchar", nullable: true })
  email?: string;

  @Column({ type: "varchar", unique: true })
  mobileNumber!: string;

  @Column({ type: "varchar" })
  password!: string; // Hashed or in-plain for simple demo credentials as requested by user

  @Column({ type: "varchar", default: "buyer" })
  role!: 'buyer' | 'seller' | 'admin';

  @Column({ type: "varchar", default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80" })
  avatar!: string;

  @Column({ type: "varchar", nullable: true })
  currentOtp?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
