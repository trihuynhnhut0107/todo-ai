export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isShared?: boolean;
  memberIds?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
  isShared?: boolean;
  isArchived?: boolean;
  order?: number;
  metadata?: Record<string, unknown>;
}

export interface ProjectQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  isArchived?: boolean;
  isShared?: boolean;
  sortBy?: "name" | "createdAt" | "updatedAt" | "order";
  sortOrder?: "ASC" | "DESC";
}

export interface AddProjectMembersDto {
  userIds: string[];
}

export interface RemoveProjectMemberDto {
  userId: string;
}

export interface ReorderProjectsDto {
  projectOrders: Array<{
    id: string;
    order: number;
  }>;
}
