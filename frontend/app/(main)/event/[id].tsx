import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useEffect } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useDeleteEvent, useEventById } from "@/query/event.query";
import { format } from "date-fns";

const eventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { mutate: deleteEvent, isSuccess: deleteSuccess } = useDeleteEvent(() =>
    router.back()
  );
  const { data: event, isLoading: pendingEvent } = useEventById(id);

  const handleDelete = () =>
    Alert.alert("Delete event?", "This action cannot be undone.", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEvent({
            id: event?.id as string,
            wp_id: event?.workspaceId as string,
          });
        },
      },
    ]);

  return (
    <View className="flex-1 p-4 pb-32 gap-4">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">Back</Text>
        </TouchableOpacity>

        <View className="flex flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() =>
              router.push(
                `/(main)/workspace/${event?.workspaceId}/event_form/${id}`
              )
            }
            className=" bg-white/30 rounded-full p-2 z-10 flex-row items-center gap-2"
          >
            <Ionicons name="pencil" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleDelete}
            className=" bg-white/30 rounded-full p-2 z-10 flex-row items-center gap-2"
          >
            <Ionicons name="trash" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="rounded-xl flex-row bg-white p-4 gap-2">
        <View
          className="w-2 rounded-full h-full"
          style={{
            backgroundColor: event?.color,
          }}
        ></View>
        <View>
          <Text className="text-3xl">{event?.name}</Text>
          <Text className="text-sm opacity-50">{event?.description}</Text>

          <View className="flex-row flex-wrap items-center gap-2 overflow-hidden">
            {event?.tags?.map((t: string, idx: number) => (
              <Text
                className="bg-black/20 rounded-lg p-1 px-2 text-black text-xs"
                key={idx}
              >
                {t}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View className="flex flex-row flex-wrap items-center gap-2 rounded-xl bg-white p-4">
        <Text className="text-sm opacity-50">Assignees</Text>
        {event?.assignees?.map((a) => (
          <Text
            className="bg-white/30 rounded-lg p-2 text-white text-sm "
            key={a.id}
          >
            {a.name}
          </Text>
        ))}
      </View>

      <View className="flex flex-row gap-2 items-start">
        {Array.from([
          event?.start ?? new Date(),
          event?.end ?? new Date(),
        ])?.map((date, idx) => (
          <View
            key={idx}
            className="flex-1 flex-col rounded-xl bg-white p-4 items-start "
          >
            <Text className="opacity-50 text-sm">{idx === 0 ? "Start" : "End"}</Text>
            <Text className="text-lg">
              {format(new Date(date), "EEE dd")}
            </Text>

            <Text className="text-2xl">
              {format(new Date(date), "HH:mm")}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default eventDetail;
