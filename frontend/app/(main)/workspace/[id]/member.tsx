import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { ScrollView } from "react-native-gesture-handler";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const member = () => {
  return (
    <ScrollView contentContainerClassName="flex-1 p-4 gap-4 ">
      <View className="flex-row items-start justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">back</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">Members</Text>
      </View>
    </ScrollView>
  );
};

export default member;
