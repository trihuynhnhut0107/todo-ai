import { GroupMemberCardProps } from "@/type";
import React from "react";
import { Text, View } from "react-native";

export default function MemberCard({ member }: GroupMemberCardProps) {
  return (
    <View className="bg-surface border-2 border-border rounded-lg p-4">
      <Text className="text-text text-lg">{member.name}</Text>
      <Text className="text-sm text-text-secondary">{member.email}</Text>
      {/* <Text className="text-sm text-gray-500">Role: {member.role}</Text> */}
    </View>
  );
}
