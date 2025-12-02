// components/theme/ThemeProvider.tsx
import { View } from "react-native";
import React, { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/store/theme.store";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const { theme, isLoaded, loadTheme } = useThemeStore();
  
  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Wait for theme to load
  if (!isLoaded) {
    return null;
  }
  
  // Determine active theme
  const activeTheme = theme === 'system' ? systemTheme : theme;

  return (
    <View style={{ flex: 1 }} className={activeTheme === 'dark' ? 'dark' : ''}>
      {children}
    </View>
  );
};

export default ThemeProvider;