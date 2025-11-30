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
            "text-base text-start w-full font-quicksand-medium text-text-secondary pl-2",
            isFocused && "!text-primary",
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
          "rounded-lg p-3 w-full text-base border-2 leading-5 text-text",
          isFocused ? "border-primary" : "border-border",
           error&& "border-red-500"
        )}
        {...rest}
      />
    </View>
  );
};

export default CustomInput;
