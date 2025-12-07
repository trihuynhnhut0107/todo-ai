import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useMemo } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native-gesture-handler";
import CustomButton from "@/components/Input/CustomButton";
import SettingTable from "@/components/UI/Setting/SettingTable";
import { SettingItemProps } from "@/type";
import { showMessage } from "react-native-flash-message";
import {
  useDeleteGroup,
  useGroupById,
  useLeaveGroup,
} from "@/query/group.query";
import useAuthStore from "@/store/auth.store";

const Setting = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: group } = useGroupById(id);
  const { mutate: deleteGroup, isPending: pendingDelete } = useDeleteGroup(() =>
    router.replace("/(main)/(tabs)/groups")
  );
  const { mutate: leaveGroup, isPending: pendingLeave } = useLeaveGroup(() =>
    router.replace("/(main)/(tabs)/groups")
  );

  const baseSettings: SettingItemProps[] = [
    {
      title: "Update group",
      color: "",
      icon: "pencil",
      url: `/(main)/group/${id}/form`,
    },
    {
      title: "View members",
      color: "",
      icon: "people",
      url: `/(main)/group/${id}/member`,
    },
    {
      title: "Add member",
      color: "",
      icon: "add",
      url: `/(main)/group/${id}/add_member`,
    },
    {
      title: "Delete group",
      color: "red",
      icon: "trash",
      onPress: () => {
        Alert.alert("Delete group?", "This action cannot be undone.", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => {
              deleteGroup(id);
            },
          },
        ]);
      },
    },
    {
      title: "Leave workspace",
      color: "red",
      icon: "log-out-outline",
      onPress: () => {
        Alert.alert("Leave group?", "This action cannot be undone.", [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Leave",
            style: "destructive",
            onPress: () => {
              leaveGroup(id);
            },
          },
        ]);
      },
    },
  ];

  const settings = useMemo(() => {
    if (group?.ownerId === user?.id) {
      return baseSettings.slice(0,-1);
    }

    // If user is NOT the owner, show only view/add members and leave option
    return [
      baseSettings[1], // View members
      baseSettings[4], // Leave workspace
    ];
  }, [group?.ownerId, user?.id, id]);
  return (
    <View className="flex-1 p-4 gap-4">
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
    </View>
  );
};

export default Setting;
