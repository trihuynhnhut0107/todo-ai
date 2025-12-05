// components/theme/ThemeProvider.tsx
import { Appearance, View } from "react-native";
import React, { useEffect, useMemo } from "react";
import { useThemeStore } from "@/store/theme.store";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, isLoaded, loadTheme } = useThemeStore();
  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const systemTheme = Appearance.getColorScheme();
  // Determine active theme
  const activeTheme = theme === "system" ? systemTheme : theme;

  return (
    <View style={{ flex: 1 }} className={activeTheme === "dark" ? "dark" : ""}>
      {children}
    </View>
  );
};

export default ThemeProvider;
