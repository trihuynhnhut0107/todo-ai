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
import Loader from "@/components/UI/Loader";
import { useColorScheme } from "react-native";


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

import cn from "clsx";
import { View } from "react-native";
export default function RootLayout() {
  const { isLoading, fetchAuthenticatedUser } = useAuthStore();
  const colorScheme = useColorScheme();
  useEffect(() => {
    fetchAuthenticatedUser();
  }, []);

  useEffect(() => {
    console.log(colorScheme);
  }, [colorScheme]);

  if (isLoading) {
    return (
      // <ThemeProvider>
      <SafeAreaView className={colorScheme as string}>
        <Loader />
      </SafeAreaView>
      // </ThemeProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View className={cn("flex-1",colorScheme as string)}>
          <BottomSheetModalProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
            <FlashMessage position="top" />
          </BottomSheetModalProvider>
        </View>
      </GestureHandlerRootView>
      {/* </ThemeProvider> */}
    </QueryClientProvider>
  );
}
