import useThemeColor from "@/hooks/useThemeColor";
import { useThemeStore } from "@/store/theme.store";
import { LinearGradient } from "expo-linear-gradient";
import { Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { View } from "react-native";

export default function GroupsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: "transparent",
        },
        animation:"none"
      }}
    />
  );
}
