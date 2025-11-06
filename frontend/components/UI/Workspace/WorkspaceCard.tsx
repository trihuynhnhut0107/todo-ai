import { View, Text } from "react-native";
import React from "react";
import { Workspace } from "@/type";
import { Link } from "expo-router";

const WorkspaceCard = ({ workspace }: { workspace: Workspace }) => {
  return (
    <Link href={`/(main)/workspace/${workspace.id}`}>
      <View className="rounded-xl w-full p-4" style={{ backgroundColor: workspace.color }}>
        <Text className="text-xl font-semibold">{workspace.name}</Text>
        <Text className="">{workspace.description}</Text>
      </View>
    </Link>
  );
};

export default WorkspaceCard;
