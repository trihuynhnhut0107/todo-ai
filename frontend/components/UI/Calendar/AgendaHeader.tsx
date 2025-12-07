import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  Pressable,
  Switch,
} from "react-native";
import React, {
  use,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AgendaHeaderItem from "./AgendaHeaderItem";
import { AgendaHeaderProps, DateWithEvents } from "@/type";
import { router } from "expo-router";
import { Feather, Ionicons } from "@expo/vector-icons";
import { format } from "date-fns";
import { useSelectedDate } from "@/context/selectedDate";
import useThemeColor from "@/hooks/useThemeColor";
import { EventStatus } from "@/enum/event";
import StatusChip from "./StatusChip";
import DateTimePicker from "react-native-modal-datetime-picker";
import CustomDateTimePicker from "@/components/Input/CustomDateTimePicker";

const AgendaHeader = ({ group, events }: AgendaHeaderProps) => {
  const { selectDate, selected, filter, setFilter, matched } =
    useSelectedDate();
  const listRef = useRef<FlatList<DateWithEvents>>(null);
  const [loaded, setLoaded] = useState(false);
  const color = useThemeColor();
  const [open, setOpen] = useState(false);
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

  const filterCount = useMemo(() => {
    let count = 0;

    if (filter?.assigned) count++;

    count += filter?.status?.length;

    return count;
  }, [filter]);

  return (
    <View
      className="bg-surface"
      style={{
        borderColor: group?.color,
      }}
    >
      <View className="px-2 pt-2">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push("/(main)/(tabs)/groups")}
              className="justify-center rounded-md p-2 z-10 flex-row items-center gap-2"
            >
              <Ionicons name="list" size={22} color={color.primary} />
            </TouchableOpacity>
            <Text className="text-primary">{group?.name}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => setOpen(true)}
              className=" justify-center rounded-md p-2 z-10 flex-row items-center gap-2 bg-accent"
            >
              {filterCount > 0 && (
                <Text className="rounded-lg text-text">{filterCount}</Text>
              )}
              <Feather name="filter" size={22} color={color.text} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push(`/(main)/group/${group?.id}/setting`)}
              className=" justify-center rounded-md p-2 z-10 flex-row items-center gap-2"
            >
              <Ionicons name="settings" size={22} color={color.primary} />
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-row justify-between items-center">
          <View className=" flex flex-row gap-2">
            <Text className="font-semibold text-3xl text-text">
              {format(new Date(selected), "MMMM")}
            </Text>
            <Text className="text-primary font-semibold text-3xl">
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

      <Text className="text-center text-text-secondary text-sm pb-2">
        {format(new Date(selected), "EEEE, MMMM dd yyyy")}
      </Text>

      <Modal visible={open} animationType="fade" transparent>
        {/* backdrop */}
        <TouchableOpacity
          className="flex-1 bg-black/40"
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        {/* color picker panel */}
        <View className="absolute left-6 right-6 bottom-6 rounded-2xl p-4 shadow-xl gap-2 bg-card border-2 border-border">
          <Text className="text-text font-bold text-2xl">
            Events: {matched}
          </Text>
          <View className="flex flex-row justify-between items-center">
            <Text className="text-text-secondary">Assigned</Text>

            <Switch
              value={filter?.assigned}
              onValueChange={(value) =>
                setFilter((prev) => ({ ...prev, assigned: value }))
              }
            />
          </View>

          <Text className="text-text-secondary">Status</Text>
          <View className="flex-row flex-wrap gap-2 items-center">
            {Object.values(EventStatus).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => {
                  setFilter((prev) => ({
                    ...prev,
                    status: prev.status.includes(status)
                      ? prev.status.filter((s) => s !== status) // Remove if selected
                      : [...prev.status, status], // Add if not selected
                  }));
                }}
                className={!filter?.status.includes(status) ? "opacity-50" : ""}
              >
                <StatusChip status={status} />
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-text-secondary">Period</Text>

          <View className="flex-row flex-wrap gap-2 items-center">
            <CustomDateTimePicker
              label="from"
              value={filter?.period?.from as Date}
              onChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  period: {
                    ...prev.period,
                    from: value,
                  },
                }));
              }}
            />
            <CustomDateTimePicker
              label="to"
              value={filter?.period?.to as Date}
              onChange={(value) => {
                setFilter((prev) => ({
                  ...prev,
                  period: {
                    ...prev.period,
                    to: value,
                  },
                }));
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default AgendaHeader;
