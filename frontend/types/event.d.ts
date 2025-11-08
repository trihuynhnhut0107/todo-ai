import { DateOrDateTime, DateTimeType, EventItem } from "@howljs/calendar-kit";

export interface Assignee {
  email: string;
  name: string;
  id: string;
}

export interface EventPayload {
  name?: string;
  description?: string;
  start: string;
  end: string;
  status?: string;
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
  status: string;
  location: string;
  color: string;
  isAllDay: boolean;
  recurrenceRule: string;
  tags: string[];
  metadata: Record<string, string>;
  workspaceId: string;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  assignees: Assignee[];
}
