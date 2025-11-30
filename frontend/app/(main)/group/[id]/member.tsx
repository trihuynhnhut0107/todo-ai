import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { FlatList, ScrollView } from "react-native-gesture-handler";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useGroupMember } from "@/query/group.query";
import MemberCard from "@/components/UI/Group/MemberCard";

const member = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: groupMembers, isLoading: pendingGroupMembers } =
    useGroupMember(id);
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

      <FlatList
        data={groupMembers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-1">
            <MemberCard member={item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="pb-48 px-1"
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        ListEmptyComponent={() =>
          pendingGroupMembers ? (
            <ActivityIndicator size="large" color="white" />
          ) : (
            <View className="items-center justify-center py-12">
              <Ionicons name="folder-outline" size={48} color={"white"} />
              <Text className="text-white text-center">
                No members in this group
              </Text>
            </View>
          )
        }
      />
    </View>
  );
};

export default member;
