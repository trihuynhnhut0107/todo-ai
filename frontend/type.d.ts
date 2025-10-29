import { EventItem, PackedEvent } from "@howljs/calendar-kit";
import { TextInputProps } from "react-native";
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface TabBarIconProps {
  focused: boolean;
  icon: any;
  acactive_icon: any;
  title: string;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomInputProps extends TextInputProps {
  label?: string;
}

export interface Workspace {
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

export interface Assignee {
  email: string;
  name: string;
  id: string;
}
export interface Event extends EventItem {
  id: string;
  name: string;
  description: string;
  start: string;
  end: string;
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

export type EventCardProps = Event | PackedEvent;

export interface AgendaHeaderProps {
  workspace: Workspace;
  events: any[];
  selected: string;
  onSelect: (date: string) => void;
}
