import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SettingItemProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const SettingItem = ({ item }: { item: SettingItemProps }) => {
  return (
    <TouchableOpacity
      onPress={() => {
        item?.onPress?.();
        if (item?.url) router.push(item.url as any);
      }}
      className="flex flex-row p-4 items-center"
    >
      <View className="min-w-[32px]">
        {item.icon && (
          <Ionicons name={item.icon as any} size={24} color={item?.color} />
        )}
      </View>
      <Text
        style={{
          color: item?.color,
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

export default SettingItem;
