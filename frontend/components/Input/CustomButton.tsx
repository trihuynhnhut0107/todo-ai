import { CustomButtonProps } from "@/type";
import cn from "clsx";
import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
const CustomButton = ({
  onPress,
  title,
  style,
  leftIcon,
  textStyle,
  isLoading = false,
}: CustomButtonProps) => {
  return (
    <TouchableOpacity className={cn("bg-primary border-2 border-primary p-2 rounded-md", style)} onPress={onPress}>
      {leftIcon}
      <View className="items-center">
        {isLoading ? (
          <ActivityIndicator size={"small"} color={"white"} />
        ) : (
          <Text className={cn("font-semibold text-white", textStyle)}>
            {title}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;