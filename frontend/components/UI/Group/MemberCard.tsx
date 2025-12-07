import useThemeColor from "@/hooks/useThemeColor";
import { GroupMemberCardProps } from "@/type";
import {
  MaterialIcons,
} from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

export default function MemberCard({
  member,
  enableDelete = false,
  onDelete,
}: GroupMemberCardProps) {
  const color = useThemeColor();
  return (
    <View className="bg-background  border-2 border-border rounded-lg p-4">
      <Text className="text-text text-lg">{member.name}</Text>
      <Text className="text-sm text-text-secondary">{member.email}</Text>
      {enableDelete && (
        <View className="flex-row gap-2 items-center justify-end">
          <TouchableOpacity
            onPress={onDelete}
            className="w-10 h-10 bg-white/30 rounded-lg flex items-center justify-center"
          >
            <MaterialIcons
              name="group-remove"
              size={24}
              color={color["text-secondary"]}
            />
          </TouchableOpacity>
        </View>
      )}
      {/* <Text className="text-sm text-gray-500">Role: {member.role}</Text> */}
    </View>
  );
}
