import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Session } from "./session.entity";

@Entity({ name: "users" })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ nullable: false })
  email!: string;

  @Column({ nullable: false })
  password!: string;

  @Column({ default: "user" })
  role!: string;

  @Column({ type: "text", nullable: true })
  pushToken?: string;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @Column({ type: "text", nullable: true })
  currentLat?: string;

  @Column({ type: "text", nullable: true })
  currentLng?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
