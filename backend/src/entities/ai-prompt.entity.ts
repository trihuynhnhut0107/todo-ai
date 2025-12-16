import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

export enum PromptType {
  SYSTEM = "system",
  USER_PREFERENCE = "user_preference",
}

@Entity({ name: "ai_prompts" })
export class AIPrompt {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "text", nullable: false })
  promptText!: string;

  @Column({
    type: "enum",
    enum: PromptType,
    default: PromptType.SYSTEM,
  })
  type!: PromptType;

  @Column({ nullable: true })
  originSessionId?: string;

  @Column({ type: "jsonb", nullable: true })
  evaluationResult?: any;

  @Column({ nullable: true })
  previousPromptId?: string;

  @ManyToOne(() => AIPrompt, (prompt) => prompt.nextPrompts)
  @JoinColumn({ name: "previousPromptId" })
  previousPrompt?: AIPrompt;

  @OneToMany(() => AIPrompt, (prompt) => prompt.previousPrompt)
  nextPrompts?: AIPrompt[];

  @CreateDateColumn()
  createdAt!: Date;
}
