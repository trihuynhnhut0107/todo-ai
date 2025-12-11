import { DateTimeType, PackedEvent } from "@howljs/calendar-kit";
import { TextInputProps } from "react-native";
import { Group, GroupMember } from "./types/group";
import { Event, Assignee } from "./types/event";
import { BaseProps } from "@react-native-community/datetimepicker";
import { User } from "./types/auth";


export interface TabBarIconProps {
  focused: boolean;
  icon: any;
  acactive_icon: any;
  title: string;
}

export interface ErrorControl {
  error?: boolean;
}

export interface MyCustomInput {
  label?: string;
}

interface CustomColorPickerProps extends ErrorControl, MyCustomInput {
  selectedColor: string | undefined;
  onSelect: (color: string) => void;
}

interface CustomIconSelectorProps extends ErrorControl, MyCustomInput {
  selectedIcon: string | undefined;
  onSelect: (iconName: string) => void;
}

export interface CustomButtonProps {
  onPress?: () => void;
  title?: string;
  style?: string;
  leftIcon?: React.ReactNode;
  textStyle?: string;
  isLoading?: boolean;
}

export interface CustomInputProps
  extends TextInputProps,
    ErrorControl,
    MyCustomInput {}

export interface CustomTagInputProps
  extends TextInputProps,
    ErrorControl,
    MyCustomInput {
  value: string[];
  onListChange: (list: string[]) => void;
}

export interface CustomDateTimePickerProps
  extends BaseProps,
    ErrorControl,
    MyCustomInput {
  onChange: (d: Date) => void;
}
export type EventCardProps = Event | PackedEvent;

export interface AgendaHeaderProps {
  group: Group | undefined;
  events: Event[] | undefined;
}

export interface DateWithEvents {
  date: string | Date;
  eventList: {
    color: string;
    start: string | DateTimeType;
    end: string | DateTimeType;
  }[];
  active?: boolean;
}

export interface SettingTableProps {
  items: SettingItemProps[];
}

export interface SettingItemProps {
  title: string;
  url?: string;
  onPress?: any;
  icon?: string;
  color?: string;
}

export interface GroupMemberCardProps {
  member: GroupMember;
  enableDelete?:boolean;
  onDelete: () => void;
}
export interface UserCardProps {
  user: User;
}

export interface AssigneeCardProps {
    assignee: Assignee;
    onDelete: () => void
}