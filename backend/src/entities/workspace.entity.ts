import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Event } from "./event.entity";

@Entity({ name: "workspaces" })
export class Workspace {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // Timezone code (e.g., "America/New_York", "UTC", "Asia/Tokyo")
  @Column({ default: "UTC" })
  timezoneCode!: string;

  // For UI: color coding workspaces
  @Column({ default: "#3B82F6" }) // Default blue
  color!: string;

  // Workspace icon/emoji
  @Column({ nullable: true })
  icon?: string;

  // Archive inactive workspaces
  @Column({ default: false })
  isArchived!: boolean;

  // Additional metadata
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  // Relations
  @Column({ type: "uuid" })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ownerId" })
  owner!: User;

  @OneToMany(() => Event, (event) => event.workspace)
  events!: Event[];

  // For team collaboration: shared with multiple users
  @ManyToMany(() => User)
  @JoinTable({
    name: "workspace_members",
    joinColumn: { name: "workspaceId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  members?: User[];

  // Ordering/position in user's workspace list
  @Column({ type: "integer", default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
