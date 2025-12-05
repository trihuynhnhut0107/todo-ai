import { View, Text, TouchableOpacity, Alert, Modal } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import {
  useDeleteEvent,
  useEventById,
  useUpdateEventStatus,
} from "@/query/event.query";
import { format } from "date-fns";
import { getColorFromString, getReadableTextColor } from "@/lib/utils";
import useAuthStore from "@/store/auth.store";
import { useGroupById, useGroupMember } from "@/query/group.query";
import { Button } from "@react-navigation/elements";
import CustomButton from "@/components/Input/CustomButton";
import { SafeAreaView } from "react-native-safe-area-context";
import { EventStatus } from "@/enum/event";
import { ScrollView } from "react-native-gesture-handler";

const eventDetail = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const { mutate: deleteEvent } = useDeleteEvent(() => router.back());
  const { mutate: updateStatus, isPending: pendingUpdateStatus } =
    useUpdateEventStatus();
  const { data: eventdata, isLoading: pendingEvent } = useEventById(id);
  const { data: members, isLoading: pendingMembers } = useGroupMember(
    eventdata?.workspaceId ?? ""
  );

  const [open, setOpen] = useState(false);

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

  const event = useMemo(() => {
    const assignees = members?.filter((m) =>
      eventdata?.assigneeIds.includes(m.id)
    );
    return {
      ...eventdata,
      assignees,
    };
  }, [eventdata, members]);

  return (
    <ScrollView contentContainerClassName="flex-1 p-4 gap-4">
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">Back</Text>
        </TouchableOpacity>

        {user?.id === event?.createdById && (
          <View className="flex flex-row items-center gap-2">
            <TouchableOpacity
              onPress={() => router.push(`/(main)/event/${id}/assign`)}
              className=" bg-white/30 rounded-full p-2 z-10 flex-row items-center gap-2"
            >
              <AntDesign name="usergroup-add" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/(main)/group/${event?.workspaceId}/event_form/${id}`
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
        )}
      </View>

      <View className="rounded-xl flex-row bg-surface p-4 gap-2">
        <View
          className="w-2 rounded-full h-full"
          style={{
            backgroundColor: event?.color,
          }}
        ></View>
        <View>
          <Text className="text-3xl text-text">{event?.name}</Text>
          <Text className="text-sm opacity-50 text-text-secondary">
            {event?.description}
          </Text>
          <Text className="text-xs mt-2 opacity-50 text-text-secondary uppercase">
            {event?.status}
          </Text>
        </View>
      </View>

      <View className="flex flex-row flex-wrap items-center gap-2 rounded-xl bg-surface p-4">
        <View className="w-full">
          <Text className="text-sm text-text-tertiary opacity-50">Tags</Text>
        </View>
        {event?.tags?.map((t: string, idx: number) => (
          <Text
            className="rounded-lg p-1 px-2  text-xs"
            key={idx}
            style={{
              backgroundColor: getColorFromString(t),
              color: getReadableTextColor(getColorFromString(t)),
            }}
          >
            {t}
          </Text>
        ))}
      </View>
      <View className="flex flex-row flex-wrap items-center gap-2 rounded-xl bg-surface p-4">
        <View className="w-full">
          <Text className="text-sm text-text-tertiary opacity-50">
            Assignees
          </Text>
        </View>
        {event?.assignees?.map((a) => (
          <Text
            className="bg-text-secondary rounded-lg px-2 py-1 text-background text-sm "
            key={a.id}
          >
            {a.email}
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
            className="flex-1 flex-col rounded-xl bg-surface p-4 items-start "
          >
            <Text className="text-sm text-text-tertiary">
              {idx === 0 ? "Start" : "End"}
            </Text>
            <Text className="text-lg text-text">
              {format(new Date(date), "EEE dd")}
            </Text>

            <Text className="text-2xl text-text">
              {format(new Date(date), "HH:mm")}
            </Text>
          </View>
        ))}
      </View>

      {event?.location && (
        <View className="flex flex-row flex-wrap items-center gap-2 rounded-xl bg-surface p-4">
          <View className="w-full">
            <Text className="text-sm text-text-tertiary opacity-50">
              Location
            </Text>
          </View>

          <Text className="text-sm text-text-secondary">{event?.location}</Text>
        </View>
      )}
      {(user?.id && event?.assigneeIds?.includes(user.id)) ||
        (user?.id === event?.createdById && (
          <>
            <CustomButton
              title="Update Status"
              style="mt-auto"
              onPress={() => setOpen(true)}
            />
            <Modal visible={open} animationType="fade" transparent>
              {/* backdrop */}
              <TouchableOpacity
                className="flex-1 bg-black/40"
                activeOpacity={1}
                onPress={() => setOpen(false)}
              />

              {/* color picker panel */}
              <View className="absolute left-6 right-6 bottom-6 rounded-2xl p-4 shadow-xl gap-2 bg-surface border-2 border-border">
                {Object.values(EventStatus)
                  .filter((status) => status !== event?.status)
                  .map((status) => (
                    <CustomButton
                      key={status}
                      isLoading={pendingUpdateStatus}
                      title={status.toUpperCase().replace("_", " ")}
                      style="px-4 py-3 rounded-xl"
                      onPress={async () =>
                        updateStatus({
                          id,
                          workspaceId: event.workspaceId ?? "",
                          payload: { status },
                        })
                      }
                    />
                  ))}
              </View>
            </Modal>
          </>
        ))}
    </ScrollView>
  );
};

export default eventDetail;
