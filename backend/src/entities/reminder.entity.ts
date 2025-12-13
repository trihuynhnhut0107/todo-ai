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
import { Event } from "./event.entity";

export enum ReminderStatus {
  PENDING = "pending",
  SENT = "sent",
  FAILED = "failed",
}

export enum ReminderType {
  LOCATION_BASED = "location",
  TIME_BASED = "time",
}

@Entity({ name: "reminders" })
export class Reminder {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column({ type: "uuid" })
  eventId!: string;

  @ManyToOne(() => Event, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventId" })
  event!: Event;

  @Column({ type: "timestamp" })
  scheduledTime!: Date;

  @Column({
    type: "enum",
    enum: ReminderStatus,
    default: ReminderStatus.PENDING,
  })
  status!: ReminderStatus;

  @Column({
    type: "enum",
    enum: ReminderType,
    default: ReminderType.LOCATION_BASED,
  })
  type!: ReminderType;

  @Column({ type: "int", nullable: true })
  travelTimeSeconds?: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
