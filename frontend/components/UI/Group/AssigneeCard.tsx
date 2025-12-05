import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { AssigneeCardProps } from "@/type";
import useThemeColor from "@/hooks/useThemeColor";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const AssigneeCard = ({ assignee, onDelete }: AssigneeCardProps) => {
  const color = useThemeColor();
  return (
    <View className="bg-surface border-2 border-border rounded-lg p-2 flex-row justify-between items-center gap-2">
      <View className="flex-col items-start">
        <Text className="text-text text-sm">{assignee.name}</Text>
        <Text className="text-xs text-text-secondary">{assignee.email}</Text>
      </View>

      <TouchableOpacity
        onPress={onDelete}
        className="w-10 h-10 bg-background rounded-lg flex items-center justify-center"
      >
        <Ionicons name="close-sharp" size={20} color={color.text} />
      </TouchableOpacity>

      {/* <Text className="text-sm text-gray-500">Role: {member.role}</Text> */}
    </View>
  );
};

export default AssigneeCard;
