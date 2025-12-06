// app/_layout.tsx
import { Stack } from "expo-router";
import "@/styles/global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import useAuthStore from "@/store/auth.store";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FlashMessage from "react-native-flash-message";
import ThemeProvider from "@/components/theme/ThemeProvider";
import Loader from "@/components/UI/Loader";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}

export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();
  
  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  if (isLoading) {
    return (
      <ThemeProvider>
        <SafeAreaView className="flex-1 justify-center items-center bg-background">
          <Loader />
        </SafeAreaView>
      </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <RootLayoutNav />
            <FlashMessage position="top" />
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}