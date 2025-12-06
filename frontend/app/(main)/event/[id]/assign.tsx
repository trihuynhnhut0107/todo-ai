import {
  View,
  Text,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React, { useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import CustomButton from "@/components/Input/CustomButton";
import {
  useAssignMember,
  useEventById,
  useUnassignMember,
} from "@/query/event.query";
import { useGroupMember } from "@/query/group.query";
import { FlatList, RefreshControl } from "react-native-gesture-handler";
import AssigneeCard from "@/components/UI/Group/AssigneeCard";
import Empty from "@/components/UI/Empty";
import { SearchBar } from "react-native-screens";
import SearchInput from "@/components/Input/SearchInput";
import UserCard from "@/components/UI/User/UserCard";
import { User } from "@/types/auth";

const assign = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: event, isLoading: pendingEvent } = useEventById(id);
  const { data: members, isFetching: pendingMembers,refetch } = useGroupMember(
    event?.workspaceId ?? ""
  );
  const { mutate: assign, isPending: pendingAssign } = useAssignMember();
  const { mutate: unassign, isPending: pendingUnAssign } = useUnassignMember();
  const [filterText, setFilterText] = useState("");

  const assignees = useMemo(() => {
    return members?.filter((m) => event?.assigneeIds.includes(m.id));
  }, [event?.assigneeIds, members]);

  const unAssigned = useMemo(() => {
    const searchTerm = filterText.toLowerCase().trim();

    return members?.filter(
      (m) =>
        !event?.assigneeIds.includes(m.id) &&
        (m.name.toLowerCase().includes(searchTerm) ||
          m.email.toLowerCase().includes(searchTerm))
    );
  }, [event?.assigneeIds, members, filterText]);

  console.log(members)
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      className="flex-1"
    >
      <View
        className="flex-1 p-4 gap-4"
        // showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-start justify-between">
          <TouchableOpacity
            onPress={() => router.back()}
            className=" bg-white/30 rounded-full p-2 px-4 z-10 flex-row items-center gap-2 w-fit"
          >
            <Ionicons name="arrow-back" size={22} color="white" />
            <Text className="text-white/70">back</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-3xl font-bold text-text">Event Assignees</Text>

        <View>
          <FlatList
            data={assignees}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View>
                <AssigneeCard
                  assignee={item}
                  onDelete={async () =>
                    unassign({ id, wp_id:event?.workspaceId||"", payload: { userId: item.id } })
                  }
                />
              </View>
            )}
            ItemSeparatorComponent={() => <View className="w-4"></View>}
            className="w-full"
            horizontal
            ListEmptyComponent={() => (
              <Text className="text-text-secondary">Unassigned...</Text>
            )}
          />
        </View>
        <SearchInput
          placeholder="Search members..."
          value={filterText}
          onChangeText={setFilterText}
        />
        <FlatList
          data={unAssigned}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => assign({ id, wp_id:event?.workspaceId||"", payload: { userIds: [item.id] } })}
              className="flex-1"
            >
              <UserCard user={item as User} />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View className="h-4"></View>}
          contentContainerClassName="pb-48 px-1"
          className="flex-1"
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={{ gap: 8 }}
          ListEmptyComponent={() => <Empty />}
          refreshControl={
            <RefreshControl refreshing={pendingMembers} onRefresh={refetch}/>
          }
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default assign;
