import { DateTimeType, EventItem, PackedEvent } from "@howljs/calendar-kit";
import { TextInputProps } from "react-native";
import { Workspace } from "./types/workspace";
import { Event } from "./types/event";
import { BaseProps } from "@react-native-community/datetimepicker";

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
  label: string;
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

export interface CustomDateTimePickerProps
  extends BaseProps,
    ErrorControl,
    MyCustomInput {
  onChange: (d: Date) => void;
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
