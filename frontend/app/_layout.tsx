import { Stack } from "expo-router";
import "@/styles/global.css";
import useAuthStore from "@/store/auth.store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator } from "react-native";
export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (isLoading)
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" className="text-primary" />
      </SafeAreaView>
    );
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
