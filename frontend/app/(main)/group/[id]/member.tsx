import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, { useMemo } from "react";
import {
  FlatList,
  RefreshControl,
} from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  useGroupById,
  useGroupMember,
  useRemoveGroupMember,
} from "@/query/group.query";
import MemberCard from "@/components/UI/Group/MemberCard";
import Empty from "@/components/UI/Empty";
import { useUserById } from "@/query/user.query";
import UserCard from "@/components/UI/User/UserCard";
import useAuthStore from "@/store/auth.store";

const Member = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const {
    data: members,
    isLoading: pendingGroupMembers,
    refetch,
  } = useGroupMember(id);
  const { data: group } = useGroupById(id);
  const { data: owner } = useUserById(group?.ownerId || "");
  const { mutate: remove } = useRemoveGroupMember();

  const handleDelete = (userId: string) => {
    Alert.alert(
      "Delete Member",
      "Are you sure you want to remove this member? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            remove({ id, payload: { userId } });
          },
        },
      ]
    );
  };

  const groupMembers = useMemo(() => {
    return members?.filter((m) => m.id !== group?.ownerId);
  }, [members, group]);
  return (
    <View className="flex-1 p-4 gap-4 ">
      <View className="flex-row items-start justify-between">
        <TouchableOpacity
          onPress={() => router.back()}
          className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
        >
          <Ionicons name="arrow-back" size={22} color="white" />
          <Text className="text-white/70">back</Text>
        </TouchableOpacity>
        <Text className="text-3xl font-bold text-white">Members</Text>
      </View>

      <View className="bg-primary gap-2 p-2 rounded-lg">
        <Text className="text text-accent font-bold">Group Admin</Text>
        {owner && <UserCard user={owner} />}
      </View>

      <View>
        <Text className="text text-text font-bold">Group Member</Text>
      </View>
      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-1">
            <MemberCard
              member={item}
              enableDelete={user?.id === group?.ownerId}
              onDelete={() => handleDelete(item.id)}
            />
          </View>
        )}
        className="flex-1 bg-background rounded-lg"
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="pb-48 p-2"
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        refreshControl={
          <RefreshControl
            refreshing={pendingGroupMembers}
            onRefresh={refetch}
          />
        }
        ListEmptyComponent={() =>
          pendingGroupMembers ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Empty />
          )
        }
      />
    </View>
  );
};

export default Member;
