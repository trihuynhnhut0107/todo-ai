import { View, Text, TouchableOpacity, Alert } from "react-native";
import React from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "@/components/Input/CustomButton";
import SettingTable from "@/components/UI/Setting/SettingTable";
import { SettingItemProps } from "@/type";
import { showMessage } from "react-native-flash-message";
import { useDeleteWorkspace } from "@/query/workspace.query";

const Setting = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { mutate: deleteWorkspace, isPending: pendingDelete } =
    useDeleteWorkspace(() => router.replace("/(main)/(tabs)/workspace"));

  const settings: SettingItemProps[] = [
    {
      title: "Update workspace",
      color: "black",
      icon: "pencil",
      url: `/(main)/workspace/${id}/form`,
    },
    {
      title: "View members",
      color: "",
      icon: "people",
      url: `/(main)/workspace/${id}/member`,
    },
    {
      title: "Add member",
      color: "",
      icon: "add",
      url: `/(main)/workspace/${id}/add_member`,
    },
    {
      title: "Delete workspace",
      color: "red",
      icon: "trash",
      onPress: () => {
        Alert.alert("Delete workspace?", "This action cannot be undone.", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteWorkspace(id);
            },
          },
        ]);
      },
    },
    {
      title: "Leave workspace",
      color: "red",
      icon: "log-out-outline",
    },
  ];
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
        <Text className="text-3xl font-bold text-white">Setting</Text>
      </View>

      <SettingTable items={settings} />
    </ScrollView>
  );
};

export default Setting;
