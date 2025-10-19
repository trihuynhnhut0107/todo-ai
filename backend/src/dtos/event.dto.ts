export interface CreateEventDto {
  name: string;
  description?: string;
  start: Date | string;
  end: Date | string;
  workspaceId: string;
  assigneeIds?: string[];
  location?: string;
  color?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  tags?: string[];
}

export interface UpdateEventDto {
  name?: string;
  description?: string;
  start?: Date | string;
  end?: Date | string;
  status?: "scheduled" | "in_progress" | "completed" | "cancelled";
  location?: string;
  color?: string;
  isAllDay?: boolean;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface EventResponse {
  id: string;
  name: string;
  description?: string;
  start: Date;
  end: Date;
  status: string;
  location?: string;
  color: string;
  isAllDay: boolean;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  workspaceId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  assignees?: {
    id: string;
    name: string;
    email: string;
  }[];
}

export interface AssignEventDto {
  userIds: string[];
}

export interface UnassignEventDto {
  userId: string;
}

export interface EventQueryDto {
  workspaceId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  status?: string;
  assigneeId?: string;
}
