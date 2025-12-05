import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useForm, Controller } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "@/components/Input/CustomInput";
import CustomIconSelector from "@/components/Input/CustomIconSelector";
import CustomColorPicker from "@/components/Input/CustomColorPicker";
import {
  useCreateGroup,
  useUpdateGroup,
  useGroupById,
} from "@/query/group.query";
import { GroupPayload } from "@/types/group";
import CustomButton from "@/components/Input/CustomButton";
import { ScrollView } from "react-native-gesture-handler";

export const schema = z.object({
  name: z.string().min(1, "Please add a name"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  timezoneCode: z.string().optional(),
  order: z.number().optional(),
});

const form = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const isEditmode = id && id !== "create";

  const { data: group, isPending: pendingoWorkspace } = useGroupById(id);
  const { mutate: createGroup, isPending: pendingCreating } = useCreateGroup();
  const { mutate: updateGroup, isPending: pendingUpdating } = useUpdateGroup();
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
      icon: "",
      color: "#ffffff",
      timezoneCode: "UTC +7",
      order: 0,
    },
  });

  const onSubmit = (data: any) => {
    const payload: GroupPayload = data;
    if (isEditmode) {
      updateGroup({ id, payload });
    } else {
      createGroup(payload);
      reset();
    }
  };

  useEffect(() => {
    if (group) {
      reset({
        name: group.name,
        description: group.description,
        icon: group.icon,
        color: group.color,
      });
    }
  }, [group]);

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
    >
      <ScrollView contentContainerClassName="p-4 gap-4 pb-32  items-start ">
        <View className="flex-row items-start justify-between w-full">
          <TouchableOpacity
            onPress={() => router.back()}
            className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
            <Text className="text-white/70">back</Text>
          </TouchableOpacity>
          <CustomButton
            isLoading={pendingCreating || pendingUpdating}
            title={isEditmode ? "Update Group" : "Add Group"}
            onPress={handleSubmit(onSubmit)}
          />
        </View>

        <View className="flex flex-row flex-wrap gap-4">
          <Text className="text-3xl font-bold text-text">
            {isEditmode ? "Edit" : "Add New"} Group
          </Text>
          <View className="rounded-xl bg-surface  p-4 gap-2 w-full">
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <View>
                  <CustomInput
                    label="Name"
                    value={field.value}
                    onChangeText={field.onChange}
                    error={!!errors.name}
                    placeholder="choose a name"
                  />
                  <Text className="text-red-500">{errors.name?.message}</Text>
                </View>
              )}
            />
          </View>

          <View className="flex-row gap-2 rounded-xl bg-surface  p-4 flex-1 ">
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
          <View className="flex-row gap-2 rounded-xl bg-surface  p-4 flex-1">
            <Controller
              control={control}
              name="icon"
              render={({ field }) => (
                <CustomIconSelector
                  label="Icon"
                  selectedIcon={field.value}
                  onSelect={field.onChange}
                />
              )}
            />
          </View>
          <View className="rounded-xl bg-surface p-4   w-full ">
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <CustomInput
                  label="Description"
                  value={field.value}
                  onChangeText={field.onChange}
                  multiline
                  numberOfLines={4}
                  error={!!errors.description}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default form;
