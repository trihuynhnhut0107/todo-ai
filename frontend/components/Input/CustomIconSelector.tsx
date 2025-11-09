import React, { useState } from "react";
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

  function handleSelect(iconName: string) {
    onSelect(iconName);
    setOpen(false);
  }

  return (
    <View>
      {label && (
        <Text
          className={cn(
            "text-base text-start w-full font-quicksand-medium text-gray-500 pl-2",
            open && "text-orange-500 font-bold",
            error && "text-red-500"
          )}
        >
          {label}
        </Text>
      )}
      <TouchableOpacity
        className={cn(
          "rounded-lg  border-2 leading-5 flex-row flex-wrap gap-2 justify-between bg-white p-2",
          open ? "border-orange-500" : "border-gray-300",
          error && "border-red-500"
        )}
        onPress={() => setOpen((prev) => !prev)}
      >
        {selectedIcon ? (
          <Ionicons name={selectedIcon as any} size={20} />
        ) : (
          <Text>Select icon</Text>
        )}
      </TouchableOpacity>

      <Modal transparent visible={open} animationType="fade">
        <TouchableOpacity
          onPress={() => setOpen(false)}
          activeOpacity={1}
          className="flex-1"
        />
        <View className="bg-white w-fit absolute top-28 left-4 right-4 rounded-lg p-4 shadow-lg overflow-auto flex-row flex-wrap gap-4">
          {TODO_ICONS.map((icon) => (
            <TouchableOpacity key={icon} onPress={() => handleSelect(icon)}>
              <Ionicons name={icon as any} size={24} color="black" />
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </View>
  );
}
