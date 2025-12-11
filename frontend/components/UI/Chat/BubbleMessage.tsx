import React from "react";
import { View, Text, useColorScheme } from "react-native";
import AIMessageRenderer from "./AIMessageRenderer";

type BubbleProps = {
  author: string | null | undefined;
  message: string;
};

const BubbleMessage: React.FC<BubbleProps> = ({ author, message }) => {
  const  theme  = useColorScheme();
  return (
    <View
      className={`max-w-[70%] mb-3 p-3 rounded-lg ${
        author !== null
          ? `${theme === "dark" ? "bg-purple-500" : "bg-blue-500"} self-end rounded-br-none` 
          : `bg-gray-100 self-start rounded-bl-none`
      }`}
    >
      {author !== null ? (
        <Text className="text-white">
          {message}
        </Text>
      ) : (
        <AIMessageRenderer content={message} />
      )}
    </View>
  );
};

export default BubbleMessage;
