import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Project } from "./project.entity";

export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TaskPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

@Entity({ name: "tasks" })
export class Task {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  title!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

  @Column({ type: "timestamp", nullable: true })
  dueDate?: Date;

  @Column({ type: "timestamp", nullable: true })
  completedAt?: Date;

  // Recurrence rule in iCalendar RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO")
  @Column({ type: "text", nullable: true })
  recurrenceRule?: string;

  // Categories/tags as JSON array
  @Column({ type: "jsonb", nullable: true })
  tags?: string[];

  // Store AI-extracted context or metadata
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  // Relations
  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid", nullable: true })
  projectId?: string;

  @ManyToOne(() => Project, (project) => project.tasks, {
    onDelete: "SET NULL",
  })
  @JoinColumn({ name: "projectId" })
  project?: Project;

  // For collaboration: assigned to another user
  @Column({ type: "uuid", nullable: true })
  assignedToId?: string;

  @ManyToOne(() => User, { onDelete: "SET NULL" })
  @JoinColumn({ name: "assignedToId" })
  assignedTo?: User;

  // Ordering/position within project or day
  @Column({ type: "integer", default: 0 })
  order!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
