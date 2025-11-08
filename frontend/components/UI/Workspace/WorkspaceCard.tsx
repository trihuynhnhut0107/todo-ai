import { View, Text } from "react-native";
import React from "react";

import { Link } from "expo-router";
import { Workspace } from "@/types/workspace";
import { getReadableTextColor } from "@/lib/utils";
import { Ionicons } from "@expo/vector-icons";

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  return (
    <Link href={`/(main)/workspace/${workspace.id}`}>
      <View
        className="flex-row items-start gap-4 rounded-xl w-full p-4"
        style={{ backgroundColor: workspace.color }}
      >
        {workspace.icon && (
          <Ionicons
            name={workspace.icon as any}
            color={getReadableTextColor(workspace.color)}
            size={24}
          />
        )}
        <View>
          <Text
            className="text-xl font-semibold"
            style={{
              color: getReadableTextColor(workspace.color),
            }}
          >
            {workspace.name}
          </Text>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{
              color: getReadableTextColor(workspace.color),
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
