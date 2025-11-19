import { CustomColorPickerProps } from "@/type";
import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import ColorPicker from "react-native-wheel-color-picker";
import cn from "clsx";
export default function CustomColorPicker({
  label,
  error,
  selectedColor,
  onSelect,
}: CustomColorPickerProps) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState(selectedColor || "#F97316");

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
        onPress={() => setOpen(true)}
        className="border-2 border-gray-300 rounded-lg p-2 flex-row items-center gap-3 bg-white"
      >
        <View
          style={{ backgroundColor: selectedColor || "#ddd" }}
          className="w-6 h-6 rounded-full"
        />
        <Text>{selectedColor || "Select color"}</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="fade" transparent>
        {/* backdrop */}
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        {/* color picker panel */}
        <View className="absolute left-6 right-6 top-36 bg-white rounded-2xl p-4 shadow-xl">
          <Text className="font-semibold mb-3 text-center">Pick a Color</Text>

          <ColorPicker
            color={color}
            thumbSize={30}
            sliderSize={30}
            noSnap
            row={false}
            onColorChange={setColor}
          />

          <TouchableOpacity
            onPress={() => {
              onSelect(color);
              setOpen(false);
            }}
            className="mt-5 bg-orange-500 py-2 rounded-lg"
          >
            <Text className="text-center text-white font-semibold">Select</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
