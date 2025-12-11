import { View } from "react-native";
import { SettingTableProps } from "@/type";
import SettingItem from "./SettingItem";
import { FlatList } from "react-native-gesture-handler";

const SettingTable = ({ items }: SettingTableProps) => {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.title}
      renderItem={({ item }) => (
        <View className="flex-1">
          <SettingItem item={item} />
        </View>
      )}
      ItemSeparatorComponent={() => <View className="h-4"></View>}
      contentContainerClassName="pb-48 px-1"
      showsVerticalScrollIndicator={false}
      numColumns={2}
      columnWrapperStyle={{ gap: 8 }}
    />
  );
};

export default SettingTable;
