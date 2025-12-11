import { View, Text, TouchableOpacity } from "react-native";
import { Event } from "@/types/event";
import { format } from "date-fns";
import { router } from "expo-router";
export interface EventReminderCardProps {
  event: Event;
}
const EventReminderCard = ({ event }: EventReminderCardProps) => {
  return (
    <TouchableOpacity onPress={() => router.push(`/(main)/event/${event.id}`)}>
      <View className="flex-col items-start rounded-lg  bg-card p-2">
        <View className="flex-row gap-2 items-center">
          <View
            className="rounded-full size-3"
            style={{ backgroundColor: event.color }}
          />
          <Text className="font-bold text-text text-lg ">{event.name}</Text>
        </View>
        <Text className="text-text-tertiary text-xs">
          {format(event.start, "HH:mm a") + "-" + format(event.end, "HH:mm a")}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default EventReminderCard;
