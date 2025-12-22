import useAuthStore from "@/store/auth.store";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Stack } from "expo-router";
import { StatusBar, StyleSheet, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useNotificationListeners } from "@/hooks/useNotificationListeners";
import { useEffect } from "react";
import { useLocation } from "@/hooks/useLocation";
import { sendUserLocation } from "@/services/user";

const MainLayout = () => {
  const { isAuthenticated } = useAuthStore();
  const theme = useColorScheme();
  const {refetch } = useLocation();

  // Set up notification listeners for handling taps
  useNotificationListeners();

  if (!isAuthenticated) return <Redirect href="/sign-in" />;

  const sendLocation = async () => {
    const location = await refetch();
    if (location?.latitude && location.longitude) {
      // Send location to backend
      await sendUserLocation({
        lat: location?.latitude,
        lng: location.longitude,
      });
    }
  };
  
  useEffect(() => {
    sendLocation();
    // Set up interval to fetch and send location every 5 minute (300000 ms)
    const intervalId = setInterval(() => {
      sendLocation();
    }, 300000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" />
      {/* === PHẦN NỀN "GIẢ LẬP" MỜ NHÒE (MỚI) === */}
      {/* Lớp 1: Vầng sáng cam-đỏ chính */}
      {/* Layer 1: Main blue gradient from top to bottom */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(5, 12, 156, 0.3)", "rgba(5, 12, 156, 0.05)"] // Navy blue fade
            : ["rgba(53, 114, 239, 0.5)", "rgba(58, 190, 249, 0.1)"] // Blue to Sea fade
        }
        style={StyleSheet.absoluteFill}
        locations={[0, 0.6]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.8 }}
      />
      {/* Layer 2: Lighter blue glow from top-right */}
      <LinearGradient
        colors={
          theme === "dark"
            ? ["rgba(53, 114, 239, 0.2)", "rgba(0, 0, 0, 0)"] // Medium blue fade
            : ["rgba(58, 190, 249, 0.4)", "rgba(167, 230, 255, 0)"] // Sea to Cold fade
        }
        style={StyleSheet.absoluteFill}
        locations={[0, 1]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: "transparent",
          },
        }}
      >
        <Stack.Screen
          name="chat"
          options={{
            animation: "slide_from_bottom",
            animationDuration: 200,
            animationTypeForReplace: "push",
          }}
        />

        <Stack.Screen
          name="(tabs)"
          options={{
            animation: "none",
          }}
        />
        <Stack.Screen
          name="group"
          options={{
            animation: "none",
            animationDuration: 200,
            animationTypeForReplace: "push",
          }}
        />
        <Stack.Screen
          name="event"
          options={{
            animation: "none",
            animationDuration: 200,
            animationTypeForReplace: "push",
          }}
        />
        {/* ...other screens */}
      </Stack>
    </SafeAreaView>
  );
};

export default MainLayout;
