import { DateTimeType, EventItem, PackedEvent } from "@howljs/calendar-kit";
import { TextInputProps } from "react-native";
import { Workspace } from "./types/workspace";
import { Event } from "./types/event";

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

export type EventCardProps = Event | PackedEvent;

export interface AgendaHeaderProps {
  workspace: Workspace | undefined;
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
