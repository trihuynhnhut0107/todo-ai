import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { registerForPushNotificationsAsync } from "../../../services/notification";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "@/store/auth.store";
import SearchInput from "@/components/Input/SearchInput";
import { Link, router } from "expo-router";
import { format } from "date-fns";

import useThemeColor from "@/hooks/useThemeColor";
import CustomInput from "@/components/Input/CustomInput";
import CustomButton from "@/components/Input/CustomButton";
import { useUpdateProfile } from "@/query/user.query";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { getGreeting } from "@/lib/utils";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import { useUpdateEventStatus, useUserEvents } from "@/query/event.query";
import EventReminderCard from "@/components/UI/Event/EventReminderCard";
import EventToDoItem from "@/components/UI/Event/EventToDoItem";
import { EventStatus } from "@/enum/event";
import Map from "@/components/UI/Map";
const profileScheme = z.object({
  name: z.string().min(1, "Please enter your name"),
});

const Header = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isEdit, setEdit] = useState(false);

  const { mutate: update, isPending: pendingUpdate } = useUpdateProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileScheme),
    defaultValues: {
      name: "",
    },
  });
  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user, reset]);
  const color = useThemeColor();

  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            queryClient.removeQueries();
            logout(); // your logout function here
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdate = (data: z.infer<typeof profileScheme>) => {
    update({ id: user?.id as string, payload: { name: data.name } });
  };

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1 gap-2">
        <View className="flex-row items-center justify-between">
          <View className=" gap-2 bg-white/30 rounded-lg p-2">
            <View className="flex-row items-center gap-2">
              <FontAwesome6 name="calendar" size={20} color="white" />
              <Text className="text-md text-white">
                {format(new Date(), "MMM dd,yyyy")}
              </Text>
            </View>
          </View>
          <View className="ml-4 flex-row gap-3 items-center bg-white/30 p-1 rounded-lg">
          

            <TouchableOpacity
              onPress={() => setEdit((prev) => !prev)}
              className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center ml-auto"
            >
              <AntDesign name="edit" size={20} color={color.text} />
            </TouchableOpacity>

            <Modal visible={isEdit} animationType="fade" transparent>
              {/* backdrop */}
              <TouchableOpacity
                className="flex-1 bg-black/40"
                activeOpacity={1}
                onPress={() => setEdit(false)}
              />
              <View className="absolute left-6 right-6 top-36 rounded-2xl p-4 shadow-xl gap-2 bg-surface border-2 border-border">
                <Text className="font-semibold mb-3 text-center text-text text-xl">
                  Edit Your Profile
                </Text>

                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <View>
                      <CustomInput
                        value={field.value}
                        onChangeText={field.onChange}
                        label="Username"
                        placeholder="Enter your username"
                        error={!!errors.name}
                      />
                      <Text className="text-red-500">
                        {errors.name?.message}
                      </Text>
                    </View>
                  )}
                />
                <CustomButton
                  isLoading={pendingUpdate}
                  onPress={handleSubmit(handleUpdate)}
                  title="Update"
                />
              </View>
            </Modal>
            <TouchableOpacity
              onPress={confirmLogout}
              className="w-10 h-10 bg-white/30  rounded-full flex items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={20} color={"white"} />
            </TouchableOpacity>
          </View>
        </View>

        <View className="bg-surface p-2 rounded-full flex-col gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={color.text}
            />
            <View>
              <Text className="text-accent">{user?.name}</Text>
              <Text className="text-text-secondary opacity-70 text-sm">
                {user?.email}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

export const EVENT_TIME_FILTERS = {
  TODAY: "today",
  THIS_WEEK: "this week",
  THIS_MONTH: "this month",
} as const;

export type EventTimeFilter =
  (typeof EVENT_TIME_FILTERS)[keyof typeof EVENT_TIME_FILTERS];

export default function Index() {
  const { user } = useAuthStore();
  const {
    data: events,
    refetch,
    isFetching: pendingEvents,
  } = useUserEvents(user?.id || "");
  const { mutate: updateStatus } = useUpdateEventStatus();
  //event time filter
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<EventTimeFilter>("today");

  const [expoPushToken, setExpoPushToken] = useState("");
  useEffect(() => {
    // Lấy token và lưu lại (ví dụ: gửi lên server)
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // TODO: Gửi token này lên backend của bạn
        // fetch('https://api.yourserver.com/register-token', {
        //   method: 'POST',
        //   body: JSON.stringify({ token: token }),
        // });
      }
    });
  }, []);

  const upcomingEventsToday = useMemo(() => {
    if (!events) return [];

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const res = events
      ?.filter((event) => {
        const start = new Date(event.start);

        // Only check if the event is on today's date (local)
        return start >= todayStart && start <= todayEnd;
      })
      ?.filter((event) => {
        return (
          event.status !== EventStatus.CANCELLED &&
          event.status !== EventStatus.COMPLETED
        );
      })
      .sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

    return res;
  }, [events]);

  const todoList = useMemo(() => {
    if (!events) return [];

    const statusOrder = {
      [EventStatus.IN_PROGRESS]: 0,
      [EventStatus.SCHEDULED]: 1,
      [EventStatus.COMPLETED]: 2,
    } as Record<EventStatus, number>;

    return events
      .filter((e) => e.status !== EventStatus.CANCELLED)
      .sort((a, b) => {
        // First, sort by status
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;

        // If same status, sort by start time (latest to earliest)
        return new Date(b.start).getTime() - new Date(a.start).getTime();
      });
  }, [events]);

  const eventLocations = useMemo(() => {
    if (!events) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return events
      .filter((event) => {
        // Filter out events without coordinates
        if (!event.lat || !event.lng) return false;

        const eventStart = new Date(event.start);
        const eventEnd = new Date(event.end);

        // Filter out past events (event has completely ended)
        if (eventEnd < now) return false;

        switch (filter) {
          case EVENT_TIME_FILTERS.TODAY:
            const eventDate = new Date(
              eventStart.getFullYear(),
              eventStart.getMonth(),
              eventStart.getDate()
            );
            return eventDate.getTime() === today.getTime();

          case EVENT_TIME_FILTERS.THIS_WEEK:
            const startOfWeek = new Date(today);
            startOfWeek.setDate(today.getDate() - today.getDay());

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            return eventStart >= startOfWeek && eventStart <= endOfWeek;

          case EVENT_TIME_FILTERS.THIS_MONTH:
            return (
              eventStart.getMonth() === now.getMonth() &&
              eventStart.getFullYear() === now.getFullYear()
            );

          default:
            return true;
        }
      })
      .map((event) => ({
        id: event.id,
        latitude: parseFloat(event.lat!),
        longitude: parseFloat(event.lng!),
        title: event.name,
        start: event.start,
        end: event.end,
        location: event.location,
        color: event.color,
        // Add any other properties you need for the map
      }));
  }, [events, filter]);

  const handleUpdateStatus = (
    id: string,
    workspaceId: string,
    status: EventStatus
  ) => {
    updateStatus({ id, workspaceId, payload: { status } });
  };
  return (
    <View className="flex-1 -mb-10 p-4">
      <Header />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={pendingEvents} onRefresh={refetch} />
        }
        className="flex-1 "
        contentContainerClassName="pb-20  gap-3 "
      >
        <Text className="text-4xl font-bold text-white my-4">
          {getGreeting()}, {user?.name}
        </Text>

        <SearchInput
          placeholder="Ask me about anything!"
          onSubmitEditing={(e) => {
            const searchText = e.nativeEvent.text;
            router.push(`/(main)/chat?query=${encodeURIComponent(searchText)}`);
          }}
        />

        <View className="bg-surface p-4 rounded-xl flex-row items-center gap-4">
          <FontAwesome6
            name="face-smile-beam"
            size={30}
            color="rgba(255, 120, 70, 1)"
          />
          <View>
            <Text className="text-lg font-bold text-text">Your mood</Text>
            <Text className="text-text mt-1 opacity-50">
              How are you feeling now? Grateful
            </Text>
          </View>
        </View>

        <View className="gap-2 rounded-xl p-2 bg-surface">
          <Text className="font-semibold text-text-tertiary">Reminder</Text>
          <FlatList
            horizontal
            data={upcomingEventsToday}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EventReminderCard event={item} />}
            ItemSeparatorComponent={() => <View className="w-2" />}
          />
        </View>

        <View className=" w-full rounded-xl bg-surface overflow-hidden gap-2  ">
          <View className="flex-row justify-between items-center p-2">
            <Text className="font-semibold text-text-tertiary">
              Event locations
            </Text>
            <TouchableOpacity
              onPress={() => setOpen(true)}
              className="rounded-lg p-1 px-2 bg-accent"
            >
              <Text className="text-text font-semibold">{filter}</Text>
            </TouchableOpacity>
            <Modal visible={open} animationType="fade" transparent>
              {/* backdrop */}
              <TouchableOpacity
                className="flex-1 bg-black/40"
                activeOpacity={1}
                onPress={() => setOpen(false)}
              />

              {/* color picker panel */}
              <View className="absolute left-6 right-6 bottom-6 rounded-2xl p-4 shadow-xl gap-2 bg-card border-2 border-border">
                {Object.entries(EVENT_TIME_FILTERS).map(([key, value]) => (
                  <TouchableOpacity
                    key={value}
                    onPress={() => setFilter(value)}
                    className={`p-3 rounded-lg ${
                      filter === value ? "bg-primary" : "bg-surface"
                    }`}
                  >
                    <Text
                      className={`text-center font-semibold ${
                        filter === value ? "text-white" : "text-text"
                      }`}
                    >
                      {key
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Modal>
          </View>
          <View className="w-full">
            <Map
              coordinates={eventLocations}
              displayUser
              // loading={pendingEvents}
            />
          </View>
        </View>
        {/* <View className="flex-1 bg-surface p-4 rounded-xl shadow-sm mb-3">
          <Text className="font-semibold text-text opacity-50">
            Appointment
          </Text>
          <Text className="font-bold text-lg text-text mt-2">Dr. Erica</Text>
          <Text className="text-text opacity-50">Therapy - 02:00 PM</Text>
          <TouchableOpacity className="flex-row items-center bg-blue-100 p-2 rounded-full mt-3 self-start">
            <FontAwesome6 name="map" size={12} color="#1e40af" />
            <Text className="text-blue-800 ml-1 text-xs font-semibold">
              Get Directions
            </Text>
          </TouchableOpacity>
        </View> */}

        <View className="gap-2 bg-surface p-2 rounded-xl">
          <Text className="text-text-tertiary font-semibold">To-do list</Text>
          <View className="gap-3 flex-col">
            {todoList?.map((e, idx) => (
              <EventToDoItem
                key={e.id}
                event={e}
                onChange={handleUpdateStatus}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
