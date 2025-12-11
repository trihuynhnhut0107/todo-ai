import useThemeColor from "@/hooks/useThemeColor";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import { useState } from "react";
import { TextInput, TextInputProps, View } from "react-native";

const SearchInput = (props: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const color = useThemeColor();
  return (
    <View
      className={cn(
        "bg-surface flex-row justify-between items-center p-2 px-4 rounded-full",props.className,
        isFocused ? "border-primary" : ""
      )}
    >
      <TextInput
        returnKeyType="search"
        submitBehavior="blurAndSubmit"
        autoCapitalize="none"
        autoComplete="off"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholderTextColor="#888"
        {...props}
        className={cn("grow overflow-hidden text-text")}
      />
      <Ionicons name="search" size={24} color={color.accent} />
    </View>
  );
};

export default SearchInput;
