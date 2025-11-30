import CustomButton from "@/components/Input/CustomButton";
import { images } from "@/lib/image";
import useAuthStore from "@/store/auth.store";
import { useThemeStore } from "@/store/theme.store";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { useQueryClient } from "@tanstack/react-query";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Redirect, Slot } from "expo-router";
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export const modalContext = createContext<{
  isOpen: "signIn" | "signUp" | string;
  setOpen: Dispatch<SetStateAction<"signIn" | "signUp" | string>>;
}>({ isOpen: "", setOpen: () => {} });

const AuthLayout = () => {
  const { theme } = useThemeStore();
  const sheetRef = useRef<BottomSheetModal>(null);
  const { isAuthenticated, fetchAuthenticatedUser, logout } = useAuthStore();
  const [isOpen, setOpen] = useState("");
  const queryClient = useQueryClient();

  useEffect(() => {
    Keyboard.dismiss();
    if (isOpen) {
      sheetRef.current?.present();
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isOpen]);

  if (isAuthenticated) return <Redirect href={"/"} />;

  return (
    <modalContext.Provider value={{ isOpen, setOpen }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerClassName=" h-full"
          keyboardShouldPersistTaps="handled"
          className="bg-background"
        >
          {/* Lớp 1: Vầng sáng cam-đỏ chính */}
          <LinearGradient
            // Bắt đầu bằng màu cam MỜ, mờ dần sang TRONG SUỐT
            colors={
              theme === "dark"
                ? ["rgba(0, 0, 0, 0.3)", "rgba(0, 0, 0, 0.05)"]
                : ["rgba(255, 120, 70, 0.5)", "rgba(255, 120, 70, 0.1)"]
            }
            style={StyleSheet.absoluteFill}
            // Vị trí: 0% là màu, 60% là trong suốt
            locations={[0, 0.6]}
            // Hướng: Từ trên (y: 0) xuống dưới (y: 0.8)
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 0.8 }}
          />

          {/* Lớp 2: Vầng sáng hồng nhẹ ở trên-phải */}
          <LinearGradient
            // Bắt đầu bằng màu hồng MỜ, mờ dần sang TRONG SUỐT
            colors={
              theme === "dark"
                ? ["rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0)"]
                : ["rgba(255, 100, 100, 0.3)", "rgba(255, 255, 255, 0)"]
            }
            style={StyleSheet.absoluteFill}
            locations={[0, 1]} // Mờ nhanh hơn
            // Hướng: Từ trên-phải (x: 0.8) chéo xuống
            start={{ x: 0.8, y: 0 }}
            end={{ x: 0.5, y: 0.7 }}
          />
          {/* <ImageBackground
            source={images.loginGraphic}
            className="relative w-full rounded-b-lg "
            resizeMode="stretch"
            style={{ height: Dimensions.get("screen").height / 2.5 }}
          >
            <Image
              source={images.logo}
              className="self-center size-48 absolute -bottom-8 z"
            />
          </ImageBackground> */}
          <SafeAreaView className="p-4 justify-center h-full">
            <Text className="text-white font-bold text-[54px]">Hello.</Text>
            <Slot />
          </SafeAreaView>
        </ScrollView>
        <BottomSheetModal
          name="authentication"
          ref={sheetRef}
          // snapPoints={snapPoints}
          enablePanDownToClose
          backgroundComponent={() => (
            <View className=" absolute top-0 left-0 right-0 bottom-0 bg-surface shadow-xl rounded-t-3xl"></View>
          )}
          backdropComponent={() => (
            <BlurView
              intensity={20} // adjust for more/less blur
              tint="dark" // or "light"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: Dimensions.get("window").width,
                height: Dimensions.get("window").height,
              }}
            />
          )}
        >
          <BottomSheetView className="gap-4 pb-32 p-8">
            <Image
              source={images.success}
              className="size-16 m-auto"
              resizeMode="contain"
            />
            <Text className="font-bold text-center text-xl text-green-500">
              {isOpen === "signUp"
                ? "Account Created Successfully"
                : "Login Successful"}
            </Text>
            <Text className="text-center text-text-secondary">
              {isOpen === "signUp"
                ? "Welcome! Your account has been created successfully."
                : "You're all set to continue where you left off."}
            </Text>
            <CustomButton
              title="Go to Homepage"
              onPress={async () => {
                await queryClient.invalidateQueries();
                fetchAuthenticatedUser();
              }}
            />
            <CustomButton
              title="Cancel"
              style="bg-surface border border-primary"
              textStyle="!text-primary"
              onPress={async () => {
                await logout();
                setOpen("");
              }}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </modalContext.Provider>
  );
};

export default AuthLayout;
