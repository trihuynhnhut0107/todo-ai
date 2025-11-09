import { User } from "../entities/user.entity";
import { Workspace } from "../entities/workspace.entity";
import { EventStatus } from "../enums/event.enum";

/**
 * Complete Event type matching the database entity
 */
export interface Event {
  // Auto-generated & system fields (required)
  id: string;
  createdAt: Date;
  updatedAt: Date;

  // Required user-provided fields
  name: string;
  start: Date;
  end: Date;
  workspaceId: string;
  createdById: string;

  // Required with defaults
  status: EventStatus;
  color: string;
  isAllDay: boolean;

  // Optional fields
  description?: string;
  location?: string;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;

  // Relations
  workspace: Workspace;
  createdBy: User;
  assignees: User[];
}
