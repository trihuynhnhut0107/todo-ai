import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AgendaHeaderItem from "./AgendaHeaderItem";

interface AgendaHeaderProps {
  selected: string;
  onSelect: (date: string) => void;
}

const AgendaHeader = ({ selected, onSelect }: AgendaHeaderProps) => {
  const listRef = useRef<FlatList<string>>(null);
  const [loaded, setLoaded] = useState(false);
  // Generate array of all days in the same month as `selected`
  const monthDates = useMemo(() => {
    const selectedDate = new Date(selected);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    // Find number of days in the month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: string[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }, [selected]);

  useEffect(() => {
    const index = monthDates.indexOf(selected);
    if (index !== -1 && listRef.current) {
      setTimeout(
        () => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
          setLoaded(true)
        },
        loaded ? 0 : 1000
      );
    }
  }, [selected, monthDates]);

  return (
    <View className="border-b-[1px] bg-transparent">
      <View className=" flex flex-row gap-2 p-2">
        <Text className="font-semibold text-3xl">
          {new Date(selected).toLocaleDateString("en-UK", {
            month: "long",
          })}
        </Text>
        <Text className="text-orange-500 font-semibold text-3xl">
          {new Date(selected).toLocaleDateString("en-UK", { year: "numeric" })}
        </Text>
      </View>

      <FlatList
        ref={listRef}
        data={monthDates}
        keyExtractor={(item) => item}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="py-2"
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item)}>
            <AgendaHeaderItem date={item} active={item === selected} />
          </TouchableOpacity>
        )}
      />

      <Text className="text-center p-2">
        {new Date(selected).toLocaleDateString("vi-VN", {
          weekday: "long",
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}
      </Text>
    </View>
  );
};

export default AgendaHeader;
