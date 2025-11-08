import { View, Text, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { useForm, Controller } from "react-hook-form";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import CustomInput from "@/components/Input/CustomInput";
import CustomIconSelector from "@/components/Input/CustomIconSelector";
import CustomColorPicker from "@/components/Input/CustomColorPicker";
import { useCreateWorkspace } from "@/query/workspace.query";
import { WorkspacePayload } from "@/types/workspace";
import CustomButton from "@/components/Input/CustomButton";

export const schema = z.object({
  name: z.string().min(1, "Please add a name"),
  description: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  timezoneCode: z.string().optional(),
  order: z.number().optional(),
});

const edit = () => {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const isEditmode = id && id !== "create";

  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
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
    const payload: WorkspacePayload = data;

    createWorkspace(payload);
  };

  return (
    <View className="p-4">
      <TouchableOpacity
        onPress={() => router.back()}
        className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
      >
        <Ionicons name="arrow-back" size={22} color="white" />
        <Text className="text-white/70">back</Text>
      </TouchableOpacity>
      <View className="rounded-lg bg-white p-4 gap-4">
        <Text className="text-3xl font-bold text-orange-500">
          {isEditmode ? "Edit" : "Add New"} Workspace
        </Text>
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
              label="Description"
              value={field.value}
              onChangeText={field.onChange}
              multiline
              error={!!errors.description}
            />
          )}
        />
        <View className="flex-row gap-2">
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
        <CustomButton
          title={isEditmode ? "Update Workspace" : "Add Workspace"}
          onPress={handleSubmit(onSubmit)}
        />
      </View>
    </View>
  );
};

export default edit;
