import React from "react";
import { View, Text } from "react-native";

type BubbleProps = {
  author: string|null|undefined;
  message: string;
};

const BubbleMessage: React.FC<BubbleProps> = ({ author, message }) => {
  return (
    <View
      className={`max-w-[70%] mb-3 p-3 rounded-lg ${
        author !== null
          ? "bg-red-500 self-end rounded-br-none"
          : "bg-gray-200 self-start rounded-bl-none"
      }`}
    >
      <Text className={`${author !== null ? "text-white" : "text-gray-800"}`}>
        {message}
      </Text>
    </View>
  );
};

export default BubbleMessage;