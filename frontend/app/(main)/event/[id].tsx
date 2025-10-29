import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const eventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  return (
    <View className="flex-1 items-start p-4 pb-32 ">
      <TouchableOpacity
        onPress={() => router.back()}
        className=" bg-white/30 rounded-full p-2 z-10 flex-row items-center gap-2"
      >
        <Ionicons name="calendar" size={22} color="white" />
        <Text className="text-white/70">Calendar</Text>
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-white">Event Name</Text>

    </View>
  );
};

export default eventDetail;
