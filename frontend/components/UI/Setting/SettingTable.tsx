import { View, Text } from "react-native";
import React from "react";
import { SettingTableProps } from "@/type";
import SettingItem from "./SettingItem";
import { FlatList } from "react-native-gesture-handler";

const SettingTable = ({ items }: SettingTableProps) => {
  return (
    <View className="bg-white rounded-lg flex-col">
      {items?.map((i, idx) => (
        <View key={idx}>
          {idx !== 0 && <View className="h-[1px] w-full bg-gray-200" />}
          <SettingItem item={i} />
        </View>
      ))}
    </View>
  );
};

export default SettingTable;
