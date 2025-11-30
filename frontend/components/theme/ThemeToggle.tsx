import { Pressable, View, Animated } from "react-native";
import { useThemeStore } from "@/store/theme.store";
import { useColorScheme } from "react-native";
import React, { useEffect, useRef } from "react";
import useThemeColor from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";

export const ThemeToggle = () => {
  const color = useThemeColor();
  const systemTheme = useColorScheme();
  const { theme, setTheme } = useThemeStore();

  const activeTheme = theme === "system" ? systemTheme : theme;
  const isDark = activeTheme === "dark";

  const anim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  // animate when theme changes (smooth thumb movement)
  useEffect(() => {
    Animated.timing(anim, {
      toValue: isDark ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const toggleTheme = () => {
    if (theme === "system" || theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <Pressable
      onPress={toggleTheme}
      style={{
        width: 48,
        height: 28,
        borderRadius: 20,
        backgroundColor: color.background, // track
        padding: 3,
      }}
    >
      <Animated.View
        style={{
          width: 22,
          height: 22,
          borderRadius: 20,
          backgroundColor: color.theme,
          transform: [
            {
              translateX: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 20], // sliding distance
              }),
            },
          ],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={14}
          color={'white'}
        />
      </Animated.View>
    </Pressable>
  );
};
