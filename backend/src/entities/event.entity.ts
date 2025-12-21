import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from "typeorm";
import { User } from "./user.entity";
import { Workspace } from "./workspace.entity";

export enum EventStatus {
  SCHEDULED = "scheduled",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

@Entity({ name: "events" })
export class Event {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ nullable: false })
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "timestamp", nullable: false })
  start!: Date;

  @Column({ type: "timestamp", nullable: false })
  end!: Date;

  @Column({
    type: "enum",
    enum: EventStatus,
    default: EventStatus.SCHEDULED,
  })
  status!: EventStatus;

  // Location (physical or virtual)
  @Column({ type: "text", nullable: true })
  location?: string;

  // Latitude
  @Column({ type: "text", nullable: true })
  lat?: string;

  // Longitude
  @Column({ type: "text", nullable: true })
  lng?: string;

  // For UI: color coding events
  @Column({ default: "#3B82F6" }) // Default blue
  color!: string;

  // All-day event flag
  @Column({ default: false })
  isAllDay!: boolean;

  // Recurrence rule in iCalendar RRULE format (e.g., "FREQ=WEEKLY;BYDAY=MO")
  @Column({ type: "text", nullable: true })
  recurrenceRule?: string;

  // Groups recurring event instances together
  @Column({ type: "uuid", nullable: true })
  recurrenceGroupId?: string;

  // Categories/tags as JSON array
  @Column({ type: "jsonb", nullable: true })
  tags?: string[];

  // Additional metadata (meeting links, attachments, etc.)
  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  // Device calendar event ID for sync
  @Column({ type: "text", nullable: true })
  calendarEventId?: string;

  // Relations
  @Column({ type: "uuid" })
  workspaceId!: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.events, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "workspaceId" })
  workspace!: Workspace;

  // Event creator
  @Column({ type: "uuid" })
  createdById!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "createdById" })
  createdBy!: User;

  // Multiple users can be assigned to an event
  @ManyToMany(() => User)
  @JoinTable({
    name: "event_assignees",
    joinColumn: { name: "eventId", referencedColumnName: "id" },
    inverseJoinColumn: { name: "userId", referencedColumnName: "id" },
  })
  assignees!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
