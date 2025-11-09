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
import { Link, useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";

const profile = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const queryClient = useQueryClient()

  const handleLogOut = () => {
    queryClient.clear()
    logout()
  }

  return (
    <ScrollView contentContainerClassName="items-center gap-4 p-4">
      <View className="rounded-full p-2 bg-white size-[150px]">
        <Image source={user?.avatar?{uri:user.avatar}:images.john_doe} className="size-full rounded-full" />
      </View>
      <Text className="text-3xl ">{user?.name}</Text>

      <View className="flex-row items-center justify-between w-full px-2">
        <Text>Personal Information</Text>

        <TouchableOpacity onPress={()=>router.push("/(main)/(tabs)/edit_profile")} className="flex-row items-center">
          <Ionicons name="pencil" size={20} color={"#3b82f6"} />
          <Text className="font-bold text-[#3b82f6]">Edit</Text>
        </TouchableOpacity>
      </View>

      <View className="items-center rounded-md bg-white w-full min-h-[300px]"></View>
      <CustomButton
        title="Sign out"
        style="w-full"
        onPress={handleLogOut}
      ></CustomButton>
    </ScrollView>
  );
};

export default profile;
