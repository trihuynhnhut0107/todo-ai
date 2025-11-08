import { CustomInputProps } from "@/type";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
const CustomInput = ({ label, error, ...rest }: CustomInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View className="w-full">
      {label && (
        <Text
          className={cn(
            "text-base text-start w-full font-quicksand-medium text-gray-500 pl-2",
            isFocused && "text-orange-500 font-bold",
            error&& "text-red-500"
          )}
        >
          {label}
        </Text>
      )}
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#888"
        className={cn(
          "rounded-lg p-3 w-full text-base border-2 leading-5",
          isFocused ? "border-orange-500" : "border-gray-300",
           error&& "border-red-500"
        )}
        {...rest}
      />
    </View>
  );
};

export default CustomInput;
