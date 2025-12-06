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
import { useAddGroupMember, useGroupMember } from "@/query/group.query";
import useAuthStore from "@/store/auth.store";
import UserCard from "@/components/UI/User/UserCard";
import { User } from "@/types/auth";

const add_member = () => {
  const { user } = useAuthStore();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: users, isLoading: pendingUsers, refetch } = useUsers();
  const { data: members, isLoading: pendingMembers } = useGroupMember(id);
  const { mutate: addMember, isPending: pendingAdding } = useAddGroupMember();
  const [filterText, setFilterText] = useState("");

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const memberIds = useMemo(() => {
    return new Set(members?.map((m) => m.id) || []);
  }, [members]);

  const filteredUsers = useMemo(() => {
    if (!users?.users) return [];

    const searchTerm = filterText.toLowerCase().trim();

    return users.users.filter((u) => {
      // Exclude current user
      if (u.id === user?.id) return false;

      // Exclude existing members (fixed logic - was !== should be ===)
      if (memberIds.has(u.id)) return false;

      // Exclude already selected users
      if (selectedIds.includes(u.id)) return false;

      // Include if no search term
      if (!searchTerm) return true;

      // Search in name or email
      return (
        u.name.toLowerCase().includes(searchTerm) ||
        u.email.toLowerCase().includes(searchTerm)
      );
    });
  }, [users, filterText, selectedIds, memberIds, user?.id]);

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
            <UserCard user={item as User} />
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
