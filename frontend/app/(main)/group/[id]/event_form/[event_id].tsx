import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "@/components/Input/CustomButton";
import CustomInput from "@/components/Input/CustomInput";
import CustomDateTimePicker from "@/components/Input/CustomDateTimePicker";
import { useForm, Controller } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateEvent,
  useEventById,
  useUpdateEvent,
} from "@/query/event.query";
import { EventPayload } from "@/types/event";
import CustomColorPicker from "@/components/Input/CustomColorPicker";
import CustomTagInput from "@/components/Input/CustomTagInput";
import CustomMapInput from "@/components/Input/CustomMapInput";

export const schema = z
  .object({
    name: z.string().min(1, "Please add a name"),
    tags: z.array(z.string()).optional(),
    description: z.string().optional(),
    color: z.string().optional(),
    start: z.date({
      required_error: "Please choose start time",
    }),

    end: z.date({
      required_error: "Please choose end time",
    }),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .optional(),
    location: z.string().optional(),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time",
    path: ["end"], // error will show under the end field
  });

const Event_form = () => {
  const { id, event_id } = useLocalSearchParams<{
    id: string;
    event_id: string;
  }>();
  const isEditmode = event_id && event_id !== "create";
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      tags: [],
      description: "",
      start: new Date(), // ✅ always give Date object
      end: new Date(), // ✅ same here
      color: "#000000",
    },
  });

  const { data: event } = useEventById(event_id);
  const { mutate: createEvent, isPending: pendingCreating } = useCreateEvent();
  const { mutate: updateEvent, isPending: pendingUpdating } = useUpdateEvent();

  useEffect(() => {
    if (event)
      reset({
        name: event?.name ||"",
        tags: event?.tags ?? [],
        description: event?.description||"",
        start: new Date(event?.start),
        end: new Date(event?.end),
        color: event?.color,
        location: event?.location,
        ...(event?.lat &&
          event?.lng && {
            coordinates: {
              lng: parseFloat(event.lng),
              lat: parseFloat(event.lat),
            },
          }),
      });
  }, [event, reset]);

  const onSubmit = (data: any) => {
    const payload: EventPayload = {
      name: data.name,
      tags: data.tags,
      description: data.description,
      start: data.start,
      end: data.end,
      color: data.color,
      location: data.location,
      lng: data.coordinates?.lng,
      lat: data.coordinates?.lat,
      // workspaceId: id
    };
    if (isEditmode) {
      updateEvent({ id: event_id, workspaceId: id, payload });
    } else {
      createEvent({ ...payload, workspaceId: id });
      reset();
    }
  };
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className="flex-1"
    >
      <ScrollView
        contentContainerClassName="p-4 pb-32 gap-4"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
            <Text className="text-white/70">back</Text>
          </TouchableOpacity>
          <CustomButton
            isLoading={pendingCreating || pendingUpdating}
            title={isEditmode ? "Update Edvent" : "Add Event"}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <Text className="text-3xl font-bold text-text">
          {isEditmode ? "Edit Event" : "Add New Event"}
        </Text>

        <View className="bg-surface rounded-xl p-4">
          <Controller
            control={control}
            name="name"
            render={({ field }) => (
              <View>
                <CustomInput
                  label="Title"
                  value={field.value}
                  onChangeText={field.onChange}
                  error={!!errors.name}
                />
                <Text className="text-red-500">{errors.name?.message}</Text>
              </View>
            )}
          />
        </View>
        <View className="bg-surface rounded-xl p-4">
          <Controller
            control={control}
            name="description"
            render={({ field }) => (
              <CustomInput
                label="Description"
                multiline={true}
                value={field.value}
                onChangeText={field.onChange}
              />
            )}
          />
        </View>
        <View className="bg-surface rounded-xl p-4">
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <CustomTagInput
                label="Tags"
                value={field.value ?? []}
                onListChange={field.onChange}
              />
            )}
          />
        </View>
        <View className="bg-surface rounded-xl p-4">
          <Controller
            control={control}
            name="color"
            render={({ field }) => (
              <CustomColorPicker
                label="Color"
                selectedColor={field.value}
                onSelect={field.onChange}
              />
            )}
          />
        </View>
        <View className=" flex-row gap-2">
          <Controller
            control={control}
            name="start"
            render={({ field }) => (
              <View className="flex-1 bg-surface rounded-xl p-4">
                <CustomDateTimePicker
                  label="start at"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.start}
                />
                <Text className="text-red-500">{errors.start?.message}</Text>
              </View>
            )}
          />
          <Controller
            control={control}
            name="end"
            render={({ field }) => (
              <View className="flex-1 bg-surface rounded-xl p-4">
                <CustomDateTimePicker
                  label="end at"
                  value={field.value}
                  onChange={field.onChange}
                  error={!!errors.end}
                />
                <Text className="text-red-500">{errors.end?.message}</Text>
              </View>
            )}
          />
        </View>
        <View className="bg-surface rounded-lg overflow-hidden">
          <Controller
            control={control}
            name="location"
            render={({ field }) => (
              <CustomInput
                multiline={true}
                value={field.value}
                placeholder="Enter address, location..."
                onChangeText={field.onChange}
              />
            )}
          />
          <Text className="text-center text-text-tertiary p-1 text-sm">
            Or pin a location on the map
          </Text>
          <Controller
            control={control}
            name="coordinates"
            render={({ field }) => (
              <CustomMapInput coord={field.value} onChange={field.onChange} />
            )}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Event_form;
