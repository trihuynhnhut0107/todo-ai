import {
  View,
  Text,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomInput from "@/components/Input/CustomInput";
import SearchInput from "@/components/Input/SearchInput";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";

import { useGroup } from "@/query/group.query";
import { router } from "expo-router";
import GroupCard from "@/components/UI/Group/GroupCard";
import Loader from "@/components/UI/Loader";
import useThemeColor from "@/hooks/useThemeColor";
import Empty from "@/components/UI/Empty";

const groups = () => {
  const color = useThemeColor();
  const [filterText, setFilterText] = useState("");
  const { data: groups, isLoading: refreshing, refetch } = useGroup();

  const filtered = useMemo(() => {
    const text = filterText.trim().toLowerCase();

    if (!text) return groups;

    return groups?.filter((w) => w.name?.toLowerCase().includes(text));
  }, [groups, filterText]);

  return (
    <View className="p-4 flex-1">
      <Text style={{ fontWeight: "bold", color: "white", fontSize: 40 }}>
        Your Groups
      </Text>
      <SearchInput
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Search groups"
        className="my-4"
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="flex-1 px-1">
            <GroupCard group={item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="pb-48 p-2"
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={{ gap: 8 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
        ListEmptyComponent={() => (refreshing ? <Loader /> : <Empty />)}
      />
      <TouchableOpacity
        onPress={() => router.push(`/(main)/group/create/form`)}
        className="absolute right-5 bottom-5 flex-row items-center p-3 bg-primary rounded-full "
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default groups;
