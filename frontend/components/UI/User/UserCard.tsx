import { View, Text } from "react-native";
import React from "react";
import { UserCardProps } from "@/type";

const UserCard = ({ user }: UserCardProps) => {
  return (
    <View className="bg-surface border-2 border-border rounded-lg p-4">
      <Text className="text-text text-lg">{user.name}</Text>
      <Text className="text-sm text-text-secondary">{user.email}</Text>

      {/* <Text className="text-sm text-gray-500">Role: {member.role}</Text> */}
    </View>
  );
};

export default UserCard;
