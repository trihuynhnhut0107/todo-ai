import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import AgendaHeaderItem from "./AgendaHeaderItem";
import { AgendaHeaderProps, DateWithEvents } from "@/type";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import workspace from "@/app/(main)/workspace/[id]";

const AgendaHeader = ({
  workspace,
  events,
  selected,
  onSelect,
}: AgendaHeaderProps) => {
  const listRef = useRef<FlatList<DateWithEvents>>(null);
  const [loaded, setLoaded] = useState(false);
  // Generate array of all days in the same month as `selected`
  const monthDates: DateWithEvents[] = useMemo(() => {
    const selectedDate = new Date(selected);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const dates: DateWithEvents[] = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const isoDate = d.toISOString().split("T")[0];

      // Count events that start or span this date
      const eventList = events
        .filter((e) => {
          const start = new Date(e.start).toISOString().split("T")[0];
          const end = new Date(e.end).toISOString().split("T")[0];
          return isoDate >= start && isoDate <= end;
        })
        .map(({ color, start, end }) => ({
          color,
          start,
          end,
        }));

      dates.push({ date: isoDate, eventList, active: isoDate === selected });
    }

    return dates;
  }, [selected, events]);

  useEffect(() => {
    const index = monthDates.findIndex((e) => e.date === selected);
    if (index !== -1 && listRef.current) {
      setTimeout(
        () => {
          listRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5,
          });
          setLoaded(true);
        },
        loaded ? 0 : 1000
      );
    }
  }, [selected, monthDates]);

  return (
    <View className="border-b-[1px] bg-transparent">
      <View className="p-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.push("/(main)/(tabs)/workspace")}
            className="justify-center rounded-md p-2 z-10 flex-row items-center gap-2"
          >
            <Ionicons name="calendar-clear" size={22} color="orange" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-orange-500">{workspace.name}</Text>
            <TouchableOpacity
              onPress={() =>
                router.push(`/(main)/workspace/${workspace.id}/setting`)
              }
              className=" justify-center rounded-md p-2 z-10 flex-row items-center gap-2"
            >
              <Ionicons name="settings" size={22} color="orange" />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <View className=" flex flex-row gap-2">
            <Text className="font-semibold text-3xl">
              {new Date(selected).toLocaleDateString("en-UK", {
                month: "long",
              })}
            </Text>
            <Text className="text-orange-500 font-semibold text-3xl">
              {new Date(selected).toLocaleDateString("en-UK", {
                year: "numeric",
              })}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={monthDates}
        keyExtractor={(item) => item.date}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="p-2"
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => onSelect(item.date)}>
            <AgendaHeaderItem date={item} />
          </TouchableOpacity>
        )}
      />

      <Text className="text-center text-sm pb-2">
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
