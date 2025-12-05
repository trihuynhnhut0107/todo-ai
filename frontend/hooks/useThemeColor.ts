import { View, Text, useColorScheme } from "react-native";
import React from "react";

const themes = {
  light: {
    primary: "#3572EF",
    secondary: "#8A2BE2",
    accent: "#A7E6FF",
    background: "#FFFFFF",
    surface: "#F9FAFB",
    card: "#FFFFFF",
    text: "#111827",
    "text-secondary": "#6B7280",
    "text-tertiary": "#9CA3AF",
    border: "#E5E7EB",
    muted: "#F3F4F6",
    success: "#10B981",
    error: "#EF4444",
    warning: "#F59E0B",
    theme: "#3572EF",
  },
  dark: {
    primary: "#3572EF",
    secondary: "#A78BFA",
    accent: "#FBBF24",
    background: "#262624",
    surface: "#2b2b29",
    card: "#1E1E2E",
    text: "#F8FAFC",
    "text-secondary": "#CBD5E1",
    "text-tertiary": "#94A3B8",
    border: "#2D2D3F",
    muted: "#16161D",
    success: "#34D399",
    error: "#F87171",
    warning: "#FBBF24",
    theme: "#8b5cf6",
  },
} as const;
const useThemeColor = () => {
  const theme = useColorScheme();
  const isDarkMode = theme === "dark";
  return isDarkMode ? themes.dark : themes.light;
};

export default useThemeColor;
