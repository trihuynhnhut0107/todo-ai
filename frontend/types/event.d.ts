import { DateOrDateTime, DateTimeType, EventItem } from "@howljs/calendar-kit";
import { User } from "./auth";
import { EventStatus } from "@/enum/event";




export interface Assignee extends User {
}

export interface EventPayload {
  name?: string;
  description?: string;
  start: string;
  end: string;
  status?: EventStatus;
  location?: string;
  color?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, string>;

  workspaceId?: string;
  assigneeIds?: string[];
}

export interface Event extends EventItem {
  id: string;
  name: string;
  description: string;
  start: string | DateTimeType | any;
  end: string | DateTimeType | any;
  status: EventStatus;
  location: string;
  color: string;
  isAllDay: boolean;
  recurrenceRule: string;
  tags: string[];
  metadata: Record<string, string>;
  workspaceId: string;
  createdById: string;
  createdBy?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  assigneeIds: string[];
  assignees?: Assignee[];
}
