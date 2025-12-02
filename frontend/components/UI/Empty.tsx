import { View, Text } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import useThemeColor from "@/hooks/useThemeColor";

const Empty = () => {
  const color = useThemeColor();
  return (
    <View className="items-center justify-center py-12">
      <Ionicons name="folder-outline" size={48} color={color.text} />
      <Text className="text-text-secondary text-center">No data found</Text>
    </View>
  );
};

export default Empty;
