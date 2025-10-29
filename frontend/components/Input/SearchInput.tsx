import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import React, { useState } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

const SearchInput = (props: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <View
      className={cn(
        "bg-white/95 flex-row justify-between items-center p-4 rounded-full shadow-sm",
        isFocused ? "border-orange-500" : ""
      )}
    >
      <TextInput
        autoCapitalize="none"
        autoComplete="off"
        {...props}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#888"
        className="grow overflow-hidden"
      />
      <Ionicons name="search" size={24} color="black" />
    </View>
  );
};

export default SearchInput;
