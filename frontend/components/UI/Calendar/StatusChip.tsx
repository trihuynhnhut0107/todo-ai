import { View, Text } from "react-native";
import React from "react";
import { EventStatus } from "@/enum/event";
import { getStatusStyles, getStatusTextStyles } from "@/lib/utils";

const StatusChip = ({ status }: { status: EventStatus }) => {
  return (
    <View className={`rounded-lg p-1 px-2 ${getStatusStyles(status)}`}>
      <Text
        className={`text-xs font-medium uppercase ${getStatusTextStyles(
          status
        )}`}
      >
        {status?.replace("_", " ")}
      </Text>
    </View>
  );
};

export default StatusChip;
