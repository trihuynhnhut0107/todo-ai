import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Message } from "./message.entity";
import { User } from "./user.entity";
import { AIPrompt } from "./ai-prompt.entity";

@Entity({ name: "sessions" })
export class Session {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @OneToMany(() => Message, (message) => message.session)
  messages: Message[];

  @JoinColumn({ name: "userId" })
  @ManyToOne(() => User, (user) => user.sessions)
  user: User;

  @Column({ nullable: false })
  userId!: string;

  @Column({ nullable: true })
  promptId?: string;

  @ManyToOne(() => AIPrompt)
  @JoinColumn({ name: "promptId" })
  prompt?: AIPrompt;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
