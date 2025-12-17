import { View, Text } from "react-native";
import { Event } from "@/types/event";
import { EventStatus } from "@/enum/event";
import CustomEventCheckbox from "@/components/Input/CustomEventCheckbox";
import { format } from "date-fns";
export interface EventToDoItemProps {
  event: Event;
  onChange: (id: string, workspaceId: string, status: EventStatus) => void;
}
const EventToDoItem = ({ event, onChange }: EventToDoItemProps) => {
  return (
    <View className="flex-row gap-2 items-start p-2 rounded-lg bg-card">
      <CustomEventCheckbox
        status={event.status}
        onStatusChange={(status) =>
          onChange(event.id, event.workspaceId, status)
        }
      />
      <View className="flex-1 gap-1">
        <Text className="text-text-secondary text-base font-semibold">
          {event.name}
        </Text>
        <View className="flex-row flex-wrap gap-x-2 justify-between items-center">
          <View className="flex-row items-center gap-1.5">
            <Text className="text-text-tertiary text-xs font-medium">
              Start:
            </Text>
            <Text className="text-text-secondary text-xs">
              {format(event.start, "dd/MM (HH:mm a)")}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Text className="text-text-tertiary text-xs font-medium">End:</Text>
            <Text className="text-text-secondary text-xs">
              {format(event.end, "dd/MM (HH:mm a)")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default EventToDoItem;
