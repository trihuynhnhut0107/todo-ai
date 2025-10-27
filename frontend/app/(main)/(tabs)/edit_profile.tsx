import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";

const editProfile = () => {
  const router = useRouter();
  return (
    <ScrollView  contentContainerClassName="items-start p-2">
      <TouchableOpacity
        onPress={() => router.back()}
        className=" bg-white/30 rounded-full p-2 z-10"
      >
        <Ionicons name="arrow-back" size={22} color="white" />
      </TouchableOpacity>
      <Text>edit</Text>
    </ScrollView>
  );
};

export default editProfile;
