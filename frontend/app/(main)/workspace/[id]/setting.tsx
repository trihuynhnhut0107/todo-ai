import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Setting = () => {
  return (
    <View>
      <TouchableOpacity
        onPress={() => router.back()}
        className=" bg-white/30 rounded-full p-2 z-10 flex-row items-center gap-2"
      >
        <Ionicons name="calendar" size={22} color="white" />
        <Text className="text-white/70">Calendar</Text>
      </TouchableOpacity>

      <Text>Setting</Text>
    </View>
  );
};

export default Setting;
