import {
  View,
  Text,
  Button,
  Touchable,
  TouchableOpacity,
  Pressable,
  Image,
} from "react-native";
import React, { useMemo } from "react";
import useAuthStore from "@/store/auth.store";
import CustomButton from "@/components/Input/CustomButton";
import { images } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";

const profile = () => {
  const { user, logout } = useAuthStore();

  return (
    <View className="p-4">
      <ScrollView contentContainerClassName="items-center gap-4">
        <View className="rounded-full p-2 bg-white size-[150px]">
          <Image source={images.john_doe} className="size-full rounded-full" />
        </View>
        <Text className="text-3xl ">{user?.name}</Text>

        <View className="flex-row items-center justify-between w-full px-2">
          <Text>Personal Information</Text>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="pencil" size={20} color={"#3b82f6"}/>
            <Text className="font-bold text-[#3b82f6]">
              Edit
            </Text>
          </TouchableOpacity>
        </View>
       
        <View className="items-center rounded-md bg-white w-full min-h-[300px]">

        </View>
        <CustomButton title="Sign out" style="w-full"  onPress={logout}></CustomButton>
      </ScrollView>
    </View>
  );
};

export default profile;
