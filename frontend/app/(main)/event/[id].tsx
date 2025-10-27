import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const eventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View className="flex-1 p-4 pb-32 bg-white">
      <Link href="/(main)/(tabs)/calendar">
        <TouchableOpacity className=" bg-black/20 rounded-full p-2 z-10">
          <Ionicons name="calendar" size={22} color="white" />
        </TouchableOpacity>
      </Link>
      <Text>eventDetail</Text>
    </View>
  );
};

export default eventDetail;
