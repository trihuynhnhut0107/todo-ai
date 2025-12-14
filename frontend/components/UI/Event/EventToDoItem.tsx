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
      <View>
        <Text className="text-text-secondary text-lg">{event.name}</Text>
        <Text className="text-text-tertiary text-xs">
          {format(event.start, "HH:mm a") + "-" + format(event.end, "HH:mm a")}
        </Text>
      </View>
    </View>
  );
};

export default EventToDoItem;
