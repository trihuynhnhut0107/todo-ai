import { getColorFromString, getReadableTextColor } from "@/lib/utils";
import { CustomTagInputProps } from "@/type";
import { Ionicons } from "@expo/vector-icons";
import cn from "clsx";
import React, { useRef, useState } from "react";
import {
  Text,
  TextInput,
  TextInputSubmitEditingEvent,
  TouchableOpacity,
  View,
} from "react-native";
const CustomTagInput = ({
  label,
  error,
  value,
  onListChange,
  ...rest
}: CustomTagInputProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleRemoveTag = (idx: number) => {
    onListChange(value?.filter((_, i) => i !== idx));
    inputRef?.current?.clear();
  };

  const handleSubmit = (e: TextInputSubmitEditingEvent) => {
    onListChange([...value, e.nativeEvent.text]);
    inputRef?.current?.clear();
  };
  return (
    <View className="w-full">
      {label && (
        <Text
          className={cn(
            "text-base text-start w-full font-quicksand-medium text-text-secondary pl-2",
            isFocused && "!text-primary",
            error && "text-red-500"
          )}
        >
          {label}
        </Text>
      )}
      <View
        className={cn(
          "rounded-lg p-3 w-full text-base border-2 leading-5 flex-col gap-2",
          isFocused ? "border-primary" : "border-border",
          error && "border-red-500"
        )}
      >
        <TextInput
          ref={inputRef}
          autoCapitalize="none"
          autoComplete="off"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          submitBehavior="submit"
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          placeholderTextColor="#888"
          placeholder="Add a tag..."
          className="text-text"
          {...rest}
        />
        <View className="flex flex-row items-center gap-2 flex-wrap">
          {value?.map((t, idx) => {
            const backgroundColor = getColorFromString(t);
            const color = getReadableTextColor(backgroundColor);
            return (
              <View
                key={idx}
                className="rounded-md gap-1 items-center flex-row p-1 px-2"
                style={{
                  backgroundColor,
                }}
              >
                <Text
                  style={{
                    color,
                  }}
                  className="text-xs"
                >
                  {t}
                </Text>
                <TouchableOpacity onPressOut={() => handleRemoveTag(idx)}>
                  <Ionicons name="close" size={16} color={color} />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

export default CustomTagInput;
