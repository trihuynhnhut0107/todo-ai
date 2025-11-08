import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "@/components/Input/CustomButton";

const Setting = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <ScrollView contentContainerClassName="flex-1 p-4 gap-4">
      <View className="flex-row items-start justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">back</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">Setting</Text>
      </View>

      <View className="bg-white rounded-lg min-h-[300px]">
        <Link href={`/(main)/event/${id}/form`}></Link>
      </View>

      <CustomButton title=" Leave Workspace" />
    </ScrollView>
  );
};

export default Setting;
