import { View, Text, Pressable } from "react-native";
import React, { useMemo } from "react";

import { Link } from "expo-router";
import { Group } from "@/types/group";
import { getReadableTextColor } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";

const GroupCard = ({ group }: { group: Group }) => {
  const color = useMemo(
    () => getReadableTextColor(group.color),
    [group?.color]
  );
  return (
    <Link href={`/(main)/group/${group.id}`}>
      <View
        className="flex-row items-center gap-4 w-full rounded-lg p-4 bg-white elevation-sm shadow-sm"
        style={{
          backgroundColor: group?.color,
        }}
      >
        {group.icon && (
          <Ionicons name={group.icon as any} color={color} size={18} />
        )}
        <View className="flex-1">
          <Text className="text-xl font-semibold" style={{ color }}>
            {group.name}
          </Text>
          <Text
            numberOfLines={2}
            ellipsizeMode="tail"
            className="opacity-80"
            style={{
              flex: 1,
              color,
            }}
          >
            {group.description}
          </Text>
          <Text
            className="mt-auto text-xs opacity-70 text-right"
            style={{ color }}
          >
            {format(new Date(group.createdAt), "MMM dd, yyyy")}
          </Text>
        </View>
      </View>
    </Link>
  );
};

export default GroupCard;
