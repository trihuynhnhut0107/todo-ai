import { View, Text, TouchableOpacity } from "react-native";
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
import { useEventById } from "@/query/event.query";

export const schema = z
  .object({
    name: z.string().min(1, "Please add a name"),
    description: z.string().optional(),

    start: z.date({
      required_error: "Please choose start time",
    }),

    end: z.date({
      required_error: "Please choose end time",
    }),
  })
  .refine((data) => data.end > data.start, {
    message: "End time must be after start time",
    path: ["end"], // error will show under the end field
  });

const event_form = () => {
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
      description: "",
      start: new Date(), // ✅ always give Date object
      end: new Date(), // ✅ same here
    },
  });

  const { data: event, isLoading: pendingEvent } = useEventById(event_id);

  useEffect(() => {
    reset({
      name: event?.name,
      description: event?.description,
      start: event?.start,
      end: event?.end,
    });
  }, [event]);

  const onSubmit = (data: any) => {
    console.log("FORM DATA:", data);
  };
  return (
    <ScrollView contentContainerClassName="flex-1 p-4 gap-4">
      <View className="flex-row items-start justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">back</Text>
        </TouchableOpacity>
      </View>
      <Text className="text-3xl font-bold text-white">
        {isEditmode ? "Edit Event" : "Add New Event"}
      </Text>

      <View className="bg-white rounded-lg min-h-[300px] p-4">
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <View>
              <CustomInput
                label="name"
                value={field.value}
                onChangeText={field.onChange}
                error={!!errors.name}
              />
              <Text className="text-red-500">{errors.name?.message}</Text>
            </View>
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <CustomInput
              label="description"
              multiline={true}
              value={field.value}
              onChangeText={field.onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="start"
          render={({ field }) => (
            <View>
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
            <View>
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

      <CustomButton
        title={isEditmode ? "Update Edvent" : "Add Event"}
        onPress={handleSubmit(onSubmit)}
      />
    </ScrollView>
  );
};

export default event_form;
