import React, { use, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  StyleSheet,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import cn from "clsx";
import { CustomIconSelectorProps } from "@/type";
import useThemeColor from "@/hooks/useThemeColor";

const TODO_ICONS = [
  "checkmark-circle",
  "checkbox",
  "clipboard",
  "list",
  "create",
  "trash",
  "alarm",
  "time",
  "calendar",
  "add-circle",
  "alert-circle",
  "calendar-outline",
  "people",
  "settings",
  "archive",
  "star",
  "sync",
  "notifications",
  "search",
  "refresh",
];

export default function CustomIconSelector({
  label,
  error,
  selectedIcon,
  onSelect,
}: CustomIconSelectorProps) {
  const [open, setOpen] = useState(false);
  const color = useThemeColor()
  function handleSelect(iconName: string) {
    onSelect(iconName);
    setOpen(false);
  }

  return (
    <View className="w-full">
      {label && (
        <Text
          className={cn(
            "text-base text-start w-full font-quicksand-medium text-text-secondary pl-2",
            open && "!text-primary",
            error && "text-red-500"
          )}
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={cn(
          "rounded-lg  border-2 leading-5 flex-row flex-wrap gap-2 justify-between items-center  p-2",
          open ? "border-primary" : "border-border",
          error && "border-red-500"
        )}
        onPress={() => setOpen((prev) => !prev)}
      >
        {selectedIcon ? (
          <Ionicons name={selectedIcon as any} size={20} color={color["text-tertiary"]} />
        ) : (
          <Ionicons name="happy-outline" size={20} color={color["text-tertiary"]} />
        )}
        <Text className="flex-1 text-center text-text-tertiary">
          {selectedIcon ? selectedIcon : "Select an icon"}
        </Text>
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <TouchableOpacity
          onPress={() => setOpen(false)}
          activeOpacity={1}
          className="flex-1"
        />
        <View className="bg-surface border-2 border-border w-fit absolute top-28 left-4 right-4 rounded-lg p-4 shadow-lg overflow-auto flex-row flex-wrap gap-4">
          {TODO_ICONS.map((icon) => (
            <TouchableOpacity key={icon} onPress={() => handleSelect(icon)}>
              <Ionicons name={icon as any} size={24} color={color["text-tertiary"]} />
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}
