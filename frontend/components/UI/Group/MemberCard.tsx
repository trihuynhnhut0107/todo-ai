import { GroupMemberCardProps } from "@/type";
import React from "react";
import { Text, View } from "react-native";

export default function MemberCard({ member }: GroupMemberCardProps) {
  return (
    <View className="bg-white rounded-lg p-4">
      <Text>{member.name}</Text>
      <Text className="text-sm text-gray-500">{member.email}</Text>
      <Text className="text-sm text-gray-500">Role: {member.role}</Text>
    </View>
  );
}
