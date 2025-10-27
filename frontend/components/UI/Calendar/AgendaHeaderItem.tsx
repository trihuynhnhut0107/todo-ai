import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { HeaderItemProps } from "@howljs/calendar-kit";
import { FlatList } from "react-native-gesture-handler";
import AgendaHeaderSubItem from "./AgendaHeaderISubItem";

const AgendaHeaderItem = ({
  props,
  onSelect,
}: {
  props: HeaderItemProps;
  onSelect: any;
}) => {
  const { extra, startUnix } = props;

  const currentDate = new Date(startUnix);

  // Convert timestamp to start and end of the week
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  // Filter only dates within the same week
  const visibleDates = (extra?.visibleDatesArray || []).filter(
    (dateStr: string) => {
      const date = new Date(dateStr);
      return date >= startOfWeek && date <= endOfWeek;
    }
  );

  return (
    <View className="p-2">
      <Text className="text-orange-500 font-semibold text-3xl">
        {currentDate.toLocaleDateString("en-UK", {
          month: "long",
          year: "numeric",
        })}
      </Text>
      <View className="flex-row gap-2 mt-2 justify-evenly w-full">
        {visibleDates.map((item: string) => (
          <TouchableOpacity key={item} onPress={() => onSelect(item)}>
            <AgendaHeaderSubItem date={item} active={item == startUnix.toString()} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default AgendaHeaderItem;
