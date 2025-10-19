import { TaskStatus, TaskPriority } from "../entities/task.entity";

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string;
  projectId?: string;
  assignedToId?: string;
  recurrenceRule?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | string | null;
  completedAt?: Date | string | null;
  projectId?: string | null;
  assignedToId?: string | null;
  recurrenceRule?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown>;
  order?: number;
}

export interface TaskQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  projectId?: string;
  assignedToId?: string;
  dueBefore?: Date | string;
  dueAfter?: Date | string;
  tags?: string[];
  sortBy?:
    | "title"
    | "createdAt"
    | "updatedAt"
    | "dueDate"
    | "priority"
    | "order";
  sortOrder?: "ASC" | "DESC";
}

export interface BulkUpdateTasksDto {
  taskIds: string[];
  updates: {
    status?: TaskStatus;
    priority?: TaskPriority;
    projectId?: string | null;
    assignedToId?: string | null;
    tags?: string[];
  };
}

export interface ReorderTasksDto {
  taskOrders: Array<{
    id: string;
    order: number;
  }>;
}

export interface TaskStatsDto {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  overdue: number;
  dueToday: number;
  dueSoon: number;
}
