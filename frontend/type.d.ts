import { TextInputProps } from "react-native";
export interface User {
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