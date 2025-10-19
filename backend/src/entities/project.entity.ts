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
import { Task } from "./task.entity";

@Entity({ name: "projects" })
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  // For UI: color coding projects
  @Column({ default: "#3B82F6" }) // Default blue
  color!: string;

  // Project icon/emoji
  @Column({ nullable: true })
  icon?: string;

  // For team collaboration features
  @Column({ default: false })
  isShared!: boolean;

  // Archive completed or inactive projects
  @Column({ default: false })
  isArchived!: boolean;

  // AI-generated insights or summary
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  // Relations
  @Column({ type: "uuid" })
  ownerId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "ownerId" })
  owner!: User;

  @OneToMany(() => Task, (task) => task.project)
  tasks!: Task[];

  // For team collaboration: shared with multiple users
  @ManyToMany(() => User)
  @JoinTable({
    name: "project_members",
    joinColumn: { name: "projectId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  members?: User[];

  // Ordering/position in user's project list
  @Column({ type: "integer", default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
