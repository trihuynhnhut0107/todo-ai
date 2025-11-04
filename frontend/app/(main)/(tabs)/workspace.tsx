import { View, Text, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import CustomInput from "@/components/Input/CustomInput";
import SearchInput from "@/components/Input/SearchInput";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { getWorkspaces } from "@/services/workspace";
import WorkspaceCard from "@/components/UI/Workspace/WorkspaceCard";
import { useWorkSpace } from "@/query/workspace.query";

const Calendar = () => {
  const [filterText, setFilterText] = useState("");
  const { data: workspaces, isLoading: refreshing, refetch } = useWorkSpace();

  const filtered = useMemo(() => {
    const text = filterText.trim().toLowerCase();

    if (!text) return workspaces;

    return workspaces?.filter((w) => w.name?.toLowerCase().includes(text));
  }, [workspaces, filterText]);

  return (
    <View className="p-4">
      <Text className="font-bold text-white text-5xl ">Your Workspace</Text>
      <SearchInput
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Search workspaces"
        className="mt-4"
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkspaceCard workspace={item} />}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="mt-4 pb-48"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refetch} />
        }
      />
    </View>
  );
};

export default Calendar;
