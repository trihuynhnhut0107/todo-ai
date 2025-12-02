import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SettingItemProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import useThemeColor from "@/hooks/useThemeColor";

const SettingItem = ({ item }: { item: SettingItemProps }) => {
  const color = useThemeColor();
  return (
    <TouchableOpacity
      onPress={() => {
        item?.onPress?.();
        if (item?.url) router.push(item.url as any);
      }}
      className="flex min-h-[100px] justify-end  p-4 items-start gap-2 bg-surface rounded-xl elevation-sm shadow-sm"
    >
      <View className="min-w-[32px]">
        {item.icon && (
          <Ionicons
            name={item.icon as any}
            size={24}
            color={item?.color || color["text-secondary"]}
          />
        )}
      </View>
      <Text
        style={{
          color: item?.color || color["text-secondary"],
        }}
      >
        {item.title}
      </Text>
    </TouchableOpacity>
  );
};

export default SettingItem;
