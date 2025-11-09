import { View, Text } from "react-native";
import React, { useMemo } from "react";

import { Link } from "expo-router";
import { Workspace } from "@/types/workspace";
import { getReadableTextColor } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  const color = useMemo(
    () => getReadableTextColor(workspace.color),
    [workspace?.color]
  );
  return (
    <Link href={`/(main)/workspace/${workspace.id}`}>
      <View
        className="flex-row items-center gap-4 rounded  w-full p-4 bg-white elevation-sm shadow-sm"
        style={{
          backgroundColor: workspace?.color,
        }}
      >
        {workspace.icon && (
          <Ionicons name={workspace.icon as any} color={color} size={18} />
        )}
        <View className="flex-1">
          <Text className="text-xl font-semibold" style={{ color }}>
            {workspace.name}
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
            {workspace.description}
          </Text>
        </View>
      </View>
    </Link>
  );
};

export default WorkspaceCard;
