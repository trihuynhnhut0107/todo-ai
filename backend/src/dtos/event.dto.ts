import { EventStatus } from "../enums/event.enum";
import { Event } from "../types/event.types";

/**
 * Create Event DTO - required and optional user-provided fields
 */
export type CreateEventDTO = Pick<
  Event,
  "name" | "start" | "end" | "workspaceId"
> &
  Partial<
    Pick<
      Event,
      | "description"
      | "location"
      | "lat"
      | "lng"
      | "recurrenceRule"
      | "tags"
      | "metadata"
      | "status"
      | "color"
      | "isAllDay"
    >
  > & {
    assigneeIds?: string[];
  };

/**
 * Update Event DTO - all fields optional
 */
export type UpdateEventDTO = Partial<Omit<CreateEventDTO, "workspaceId">>;

/**
 * Event query/filter options
 */
export interface EventQueryOptions {
  workspaceId: string;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  createdById?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

/**
 * Create Event DTO for TSOA controller
 */
export interface CreateEventDto {
  name: string;
  start: Date;
  end: Date;
  workspaceId: string;
  description?: string;
  location?: string;
  lat?: string | number;
  lng?: string | number;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  status?: EventStatus;
  color?: string;
  isAllDay?: boolean;
  assigneeIds?: string[];
}

/**
 * Update Event DTO for TSOA controller
 */
export interface UpdateEventDto {
  name?: string;
  start?: Date;
  end?: Date;
  description?: string;
  location?: string;
  lat?: string | number;
  lng?: string | number;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  status?: EventStatus;
  color?: string;
  isAllDay?: boolean;
  assigneeIds?: string[];
}

/**
 * Event Response DTO - for API responses
 */
export interface EventResponse {
  id: string;
  name: string;
  start: Date;
  end: Date;
  workspaceId: string;
  createdById: string;
  status: EventStatus;
  color: string;
  isAllDay: boolean;
  description?: string;
  location?: string;
  lat?: string;
  lng?: string;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  assigneeIds?: string[];
}

/**
 * Assign Event DTO
 */
export interface AssignEventDto {
  userIds: string[];
}

/**
 * Unassign Event DTO
 */
export interface UnassignEventDto {
  userId: string;
}

/**
 * Event Query DTO for TSOA controller
 */
export interface EventQueryDto {
  workspaceId?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  assigneeId?: string;
}
