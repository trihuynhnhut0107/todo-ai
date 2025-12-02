import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React, { use, useMemo, useState } from "react";
import {
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useUsers } from "@/query/user.query";
import SearchInput from "@/components/Input/SearchInput";
import MemberCard from "@/components/UI/Group/MemberCard";
import { GroupMember } from "@/types/group";
import Empty from "@/components/UI/Empty";
import CustomButton from "@/components/Input/CustomButton";
import { useAddGroupMember } from "@/query/group.query";

const add_member = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: users, isLoading: pendingUsers, refetch } = useUsers();
  const { mutate: addMember, isPending: pendingAdding } = useAddGroupMember();
  const [filterText, setFilterText] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredUsers = useMemo(() => {
    console.log(users);
    if (!users) return [];
    return users.users?.filter(
      (user) =>
        !selectedIds.includes(user.id) &&
        (user.name.toLowerCase().includes(filterText.toLowerCase()) ||
          user.email.toLowerCase().includes(filterText.toLowerCase()))
    );
  }, [users, filterText, selectedIds]);

  const selectedUsers = useMemo(() => {
    return users?.users?.filter((u) => selectedIds.includes(u.id)) ?? [];
  }, [users, selectedIds]);

  const handleAdd = () => {
    const payload = { userIds: selectedIds };
    addMember({
      id,
      payload,
    });
  };
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
        <Text className="text-3xl font-bold text-white">Add Member</Text>
      </View>
      <SearchInput
        placeholder="Search users..."
        value={filterText}
        onChangeText={setFilterText}
      />

      <View className="flex-row flex-wrap gap-2 items-center">
        {selectedUsers?.map((user) => (
          <TouchableOpacity
            key={user.id}
            onPress={() =>
              setSelectedIds((prev) => prev.filter((id) => id !== user.id))
            }
            className="bg-surface rounded-lg p-1 px-2"
          >
            <Text className="text-text-tertiary text-sm mb-1">
              {user.email}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setSelectedIds((prev) => [...prev, item.id])}
            className="flex-1"
          >
            <MemberCard member={item as GroupMember} />
          </TouchableOpacity>
        )}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="pb-48 px-1"
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={pendingUsers} onRefresh={refetch} />
        }
        ListEmptyComponent={() =>
          pendingUsers ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <Empty />
          )
        }
      />
      {selectedIds.length > 0 && (
        <CustomButton
          title="Add Member"
          isLoading={pendingAdding}
          onPress={handleAdd}
        />
      )}
    </View>
  );
};

export default add_member;
