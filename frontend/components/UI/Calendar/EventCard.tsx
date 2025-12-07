import { View, Text} from "react-native";
import { Link } from "expo-router";
import { EventCardProps } from "@/type";
import { format } from "date-fns";
import {
  getColorFromString,
  getReadableTextColor,
  getStatusStyles,
} from "@/lib/utils";
import cn from "clsx";
const EventCard = ({ event }: { event: EventCardProps }) => {
  return (
    <Link href={`/(main)/event/${event.id}`}>
      <View
        className={cn(
          "flex-row items-start p-3 gap-2 border-2 rounded-lg bg-surface truncate"
        )}
        style={{
          borderColor: event.color,
          width: "100%",
          height: "100%",
        }}
      >
        <View
          className={cn(
            "w-2 rounded-full h-full",
            getStatusStyles(event.status)
          )}
        ></View>
        <View className="flex-col flex-1">
          <View className="flex-col items-start gap-1 overflow-hidden">
            <Text className="text-xl text-text">{event.name}</Text>
            <Text
              className="text-xs text-text-tertiary truncate"
              numberOfLines={1}
            >
              cre: {event.createdBy}
            </Text>

            <Text className="text-text-secondary text-sm">
              <Text>{`${format(new Date(event.displayStart), "dd/MM")}`}</Text>
              <Text className="text-text-tertiary">
                {" "}
                {`${format(new Date(event.displayStart), "HH:mm")}`}
              </Text>
              <Text> - </Text>
              <Text>{`${format(new Date(event.displayEnd), "dd/MM")}`}</Text>
              <Text className="text-text-tertiary">
                {" "}
                {`${format(new Date(event.displayEnd), "HH:mm")}`}
              </Text>
            </Text>
            <View className="flex-row relative justify-start">
              {event.assignees?.map((m: any, idx: number) => (
                <Text key={idx}>{m.name}</Text>
              ))}
            </View>
          </View>

          <View className="flex-row flex-wrap items-center gap-2 overflow-hidden">
            {event?.tags?.map((t: string, idx: number) => (
              <Text
                className=" rounded-lg p-1 px-2 text-xs"
                key={idx}
                style={{
                  backgroundColor: getColorFromString(t),
                  color: getReadableTextColor(getColorFromString(t)),
                }}
              >
                {t}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Link>
  );
};

export default EventCard;
