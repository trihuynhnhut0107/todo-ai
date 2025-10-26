import { CustomInputProps } from "@/type";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
const CustomInput = ({ label, ...rest }: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View className="w-full">
      <Text
        className={cn(
          "text-base text-start w-full font-quicksand-medium text-gray-500 pl-2",
          isFocused && "text-orange-500 font-bold"
        )}
      >
        {label}
      </Text>
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        {...rest}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#888"
        className={cn(
          "rounded-lg p-3 w-full text-base border-2 leading-5",
          isFocused ? "border-orange-500" : "border-gray-300"
        )}
      />
    </View>
  );
};

export default CustomInput;