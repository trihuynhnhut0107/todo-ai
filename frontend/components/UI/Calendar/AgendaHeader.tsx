import { View, Text, FlatList, TouchableOpacity } from "react-native";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import AgendaHeaderItem from "./AgendaHeaderItem";
import { AgendaHeaderProps, DateWithEvents } from "@/type";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useSelectedDate } from "@/context/selectedDate";

const AgendaHeader = ({ workspace, events }: AgendaHeaderProps) => {
  const { selectDate, selected } = useSelectedDate();
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
      const date = new Date(Date.UTC(year, month, i));
      const dayStart = new Date(year, month, i, 0, 0, 0, 0); // Start of day
      const dayEnd = new Date(year, month, i, 23, 59, 59, 999); // End of day

      // Count events that start or span this date
      const eventList =
        events
          ?.filter((e) => {
            const eventStart = new Date(e.start.toString());
            const eventEnd = new Date(e.end.toString());
            // Event overlaps with this day if:
            // event starts before day ends AND event ends after day starts
            return eventStart <= dayEnd && eventEnd >= dayStart;
          })
          ?.map(({ color, start, end }) => ({
            color,
            start,
            end,
          })) ?? [];

      dates.push({
        date,
        eventList,
        active: date.toISOString().split("T")[0] === selected,
      });
    }

    return dates;
  }, [selected, events]);

  useEffect(() => {
    const index = monthDates.findIndex((e) => e.active);
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
    <View className="border-b-[1px]">
      <View className="p-2">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => router.push("/(main)/(tabs)/workspace")}
            className="justify-center rounded-md p-2 z-10 flex-row items-center gap-2"
          >
            <Ionicons name="list" size={22} color="orange" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Text className="text-orange-500">{workspace?.name}</Text>
            <TouchableOpacity
              onPress={() =>
                router.push(`/(main)/workspace/${workspace?.id}/setting`)
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
              {format(new Date(selected), "MMMM")}
            </Text>
            <Text className="text-orange-500 font-semibold text-3xl">
              {format(new Date(selected), "yyyy")}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={monthDates}
        keyExtractor={(item) => item.date.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="p-2"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              console.log("clicked");
              selectDate(item.date as string);
            }}
          >
            <AgendaHeaderItem date={item} />
          </TouchableOpacity>
        )}
      />

      <Text className="text-center text-sm pb-2">
        {format(new Date(selected), "EEEE, MMMM dd yyyy")}
      </Text>
    </View>
  );
};

export default AgendaHeader;
