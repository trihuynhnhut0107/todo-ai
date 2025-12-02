import { CustomColorPickerProps } from "@/type";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import cn from "clsx";
import CustomButton from "./CustomButton";
export default function CustomColorPicker({
  label,
  error,
  selectedColor,
  onSelect,
}: CustomColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(selectedColor || "#F97316");

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
        onPress={() => setOpen(true)}
        className="border-2 border-border rounded-lg  p-2 flex-row items-center gap-3 "
      >
        <View
          style={{ backgroundColor: selectedColor || "#ddd" }}
          className="w-6 h-6 rounded-lg flex-1"
        />
        <Text className="text-text-tertiary">
          {selectedColor || "Select color"}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="fade" transparent>
        {/* backdrop */}
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        {/* color picker panel */}
        <View className="absolute left-6 right-6 top-36 rounded-2xl p-4 shadow-xl gap-2 bg-surface border-2 border-border">
          <Text className="font-semibold mb-3 text-center text-text text-xl">Pick a Color</Text>

          <ColorPicker
            color={color}
            thumbSize={30}
            sliderSize={30}
            noSnap
            row={false}
            onColorChange={setColor}
          />

          <CustomButton
            onPress={() => {
              onSelect(color);
              setOpen(false);
            }}
            title="Select"
          />
        </View>
      </Modal>
    </View>
  );
}
