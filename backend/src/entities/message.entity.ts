import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { SenderType } from "../enums/role.enum";
import { Session } from "./session.entity";

@Entity({ name: "messages" })
export class Message {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  senderId!: string;

  @Column({ nullable: false })
  content!: string;

  @Column({ enum: SenderType, type: "enum" })
  senderType!: SenderType;

  @Column({ nullable: true, type: "jsonb" })
  metadata?: object;

  @JoinColumn({ name: "sessionId" })
  @ManyToOne(() => Session, (session) => session.messages, { onDelete: "CASCADE" })
  session!: Session;

  @Column({ nullable: false })
  sessionId: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
