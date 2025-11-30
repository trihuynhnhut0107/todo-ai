export interface Group {
  id: string;
  name: string;
  description: string;
  timezoneCode: string;
  color: string;
  icon: string;
  isArchived: boolean;
  metadata: Record<string, string>;
  ownerId: string;
  order: number;
  createdAt: Date | string;
  updatedAt: Date | string;
  memberCount: number;
  eventCount: number;
}

export interface GroupPayload {
  name: string;
  description: string;
  timezoneCode: string;
  color: string;
  icon: string;
  order: number;
}
