import { View, Text, RefreshControl } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import CustomInput from "@/components/Input/CustomInput";
import SearchInput from "@/components/Input/SearchInput";
import { Ionicons } from "@expo/vector-icons";
import { FlatList, TextInput } from "react-native-gesture-handler";
import { getWorkspaces } from "@/services/workspace";
import { Workspace } from "@/type";
import WorkspaceCard from "@/components/UI/Workspace/WorkspaceCard";

const Calendar = () => {
  const [filterText, setFilterText] = useState("");
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState(["Apple", "Banana", "Orange"]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    fetchWorkspace();
  }, []);

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const fetchWorkspace = () => {
    getWorkspaces()
      .then((data) => {
        setWorkspaces(data);
      })
      .finally(() => setRefreshing(false));
  };

  return (
    <View className="p-4">
      <Text className="font-bold text-white text-5xl ">Your Workspace</Text>
      <SearchInput
        value={filterText}
        onChangeText={setFilterText}
        placeholder="Search workspaces"
      />

      <FlatList
        data={workspaces}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkspaceCard workspace={item} />}
        ItemSeparatorComponent={() => <View className="h-4"></View>}
        contentContainerClassName="mt-4 pb-48"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

export default Calendar;
