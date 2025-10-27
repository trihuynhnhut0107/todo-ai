import { View, Text } from "react-native";
import React, { useMemo } from "react";

const AgendaHeaderSubItem = ({
  date,
  active,
}: {
  date: string;
  active: boolean;
}) => {
  const today = useMemo(() => {
    const now = new Date();
    const target = new Date(date);
    return (
      now.getFullYear() === target.getFullYear() &&
      now.getMonth() === target.getMonth() &&
      now.getDate() === target.getDate()
    );
  }, [date]);
  return (
    <View className="items-center gap-2 ">
      <Text>
        {new Date(date).toLocaleDateString("en-UK", { weekday: "short" })}
      </Text>
      <Text
        className="rounded-full p-2"
        style={{
          color: today ? "orangered" : active? "white": "black",
          backgroundColor: active ? "orange" : "",
        }}
      >
        {new Date(date).toLocaleDateString("en-UK", { day: "2-digit" })}
      </Text>
    </View>
  );
};

export default AgendaHeaderSubItem;
