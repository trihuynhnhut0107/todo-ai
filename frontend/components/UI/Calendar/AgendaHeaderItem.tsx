import { View, Text } from "react-native";
import React, { useMemo } from "react";
import { DateWithEvents } from "@/type";

const AgendaHeaderItem = ({ date }: { date: DateWithEvents }) => {
  const today = useMemo(() => {
    const now = new Date();
    const target = new Date(date.date);
    return (
      now.getFullYear() === target.getFullYear() &&
      now.getMonth() === target.getMonth() &&
      now.getDate() === target.getDate()
    );
  }, [date]);
  return (
    <View
      className="items-center gap-2 p-2 rounded-lg min-w-[50px] max-w-[50px]"
      style={{
        backgroundColor: date.active ? "orange" : "",
      }}
    >
      <Text>
        {new Date(date.date).toLocaleDateString("en-UK", { weekday: "short" })}
      </Text>
      <Text
        className="rounded-full p-2 "
        style={{
          color: date.active ? "white" : today ? "orangered" : "black",
        }}
      >
        {new Date(date.date).toLocaleDateString("en-UK", { day: "2-digit" })}
      </Text>
      <View className="gap-1 flex-row flex-wrap">
        {date.eventList?.map((e, idx) => (
          <View
            key={idx}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              backgroundColor: e.color,
            }}
          ></View>
        ))}
      </View>
    </View>
  );
};

export default AgendaHeaderItem;
