
import CustomButton from "@/components/CustomButton";
import useAuthStore from "@/store/auth.store";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
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


const AuthLayout = () => {
  const sheetRef = useRef<BottomSheetModal>(null);
  const { isAuthenticated, fetchAuthenticatedUser, logout } = useAuthStore();
  const [isOpen, setOpen] = useState(true);

  useEffect(() => {
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
          contentContainerClassName="bg-white h-full"
          keyboardShouldPersistTaps="handled"
        >
          <SafeAreaView>
            <Slot />
          </SafeAreaView>
        </ScrollView>
        <BottomSheetModal
          ref={sheetRef}
          // snapPoints={snapPoints}
          enablePanDownToClose
          backgroundComponent={() => (
            <View className=" absolute top-0 left-0 right-0 bottom-0 bg-white shadow-xl rounded-t-3xl"></View>
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
          <BottomSheetView className="items-center gap-4 pb-32 p-4">
            {/* <Image
              source={images.success}
              className="size-44"
              resizeMode="contain"
            /> */}
            <Text className="h3-bold">Login Successful</Text>
            <Text className="body-regular">
              You’re all set to continue where you left off.
            </Text>
            <CustomButton
              title="Go to Homepage"
              onPress={fetchAuthenticatedUser}
            />
            <CustomButton
              title="Cancel"
              style="bg-white border border-primary"
              textStyle="!text-primary"
              onPress={async () => {
                await logout();
                sheetRef.current?.dismiss();
              }}
            />
          </BottomSheetView>
        </BottomSheetModal>
      </KeyboardAvoidingView>
    </modalContext.Provider>
  );
};

export default AuthLayout;