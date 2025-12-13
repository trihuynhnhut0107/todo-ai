import { Pressable, View } from "react-native";
import { Entypo, FontAwesome5 } from "@expo/vector-icons";
import { EventStatus } from "@/enum/event";
import { getStatusStyles } from "@/lib/utils";
import cn from "clsx";
interface CustomEventCheckboxProps {
  status: EventStatus;
  onStatusChange: (status: EventStatus) => void;
}

const CustomEventCheckbox = ({
  status,
  onStatusChange,
}: CustomEventCheckboxProps) => {
  const getNextStatus = () => {
    switch (status) {
      case EventStatus.SCHEDULED:
        return EventStatus.IN_PROGRESS;
      case EventStatus.IN_PROGRESS:
        return EventStatus.COMPLETED;
      case EventStatus.COMPLETED:
        return EventStatus.SCHEDULED;
      default:
        return EventStatus.SCHEDULED;
    }
  };
  const getIcon = () => {
    switch (status) {
      case EventStatus.SCHEDULED:
        return null;
      case EventStatus.IN_PROGRESS:
        return <Entypo name="time-slot" size={16} color="white" />;
      case EventStatus.COMPLETED:
        return <FontAwesome5 name="check" size={16} color="white" />;
      default:
        return null;
    }
  };

  return (
    <Pressable
      onPress={() => onStatusChange(getNextStatus())}
      className="flex-row items-center gap-2"
    >
      <View
        className={cn(
          `w-6 h-6 border-2 rounded-md items-center justify-center`,
          getStatusStyles(status)
        )}
      >
        {getIcon()}
      </View>
    </Pressable>
  );
};

export default CustomEventCheckbox;
