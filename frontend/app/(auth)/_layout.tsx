import CustomButton from "@/components/CustomButton";
import useAuthStore from "@/store/auth.store";
// import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
// import { BlurView } from "expo-blur";
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
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

export const modalContext = createContext<{
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}>({ isOpen: false, setOpen: () => {} });

export default function  AuthLayout () {
  // const sheetRef = useRef<BottomSheetModal>(null);
  const { isAuthenticated, fetchAuthenticatedUser, logout } = useAuthStore();
  const [isOpen, setOpen] = useState(true);

  // useEffect(() => {
  //   if (isOpen) {
  //     sheetRef.current?.present();
  //   } else {
  //     sheetRef.current?.dismiss();
  //   }
  // }, [isOpen]);

  if (isAuthenticated) return <Redirect href={"/"} />;

  return (
    <modalContext.Provider value={{ isOpen, setOpen }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerClassName="bg-white h-full"
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
            <Slot />
          </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>
    </modalContext.Provider>
  );
};

