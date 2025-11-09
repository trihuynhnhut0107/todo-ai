import { Stack } from "expo-router";
import "@/styles/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, Keyboard } from "react-native";
import useAuthStore from "@/store/auth.store";
import {
  BottomSheetModalProvider,
  TouchableWithoutFeedback,
} from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashMessage from "react-native-flash-message";
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // cache for 5 minutes
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <BottomSheetModalProvider>
          <Stack screenOptions={{ headerShown: false }} />

          <FlashMessage position="top" />
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
