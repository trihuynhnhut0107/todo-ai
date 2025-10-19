export interface CreateWorkspaceDto {
  name: string;
  description?: string;
  timezoneCode?: string;
  color?: string;
  icon?: string;
  order?: number;
}

export interface UpdateWorkspaceDto {
  name?: string;
  description?: string;
  timezoneCode?: string;
  color?: string;
  icon?: string;
  isArchived?: boolean;
  order?: number;
  metadata?: Record<string, unknown>;
}

export interface WorkspaceResponse {
  id: string;
  name: string;
  description?: string;
  timezoneCode: string;
  color: string;
  icon?: string;
  isArchived: boolean;
  metadata?: Record<string, unknown>;
  ownerId: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  memberCount?: number;
  eventCount?: number;
}

export interface AddWorkspaceMemberDto {
  userIds: string[];
}

export interface RemoveWorkspaceMemberDto {
  userId: string;
}
