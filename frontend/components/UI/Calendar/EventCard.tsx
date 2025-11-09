import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { images } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { EventCardProps } from "@/type";
import { format } from "date-fns";

const EventCard = ({ event }: { event: EventCardProps }) => {
  return (
    <Link href={`/(main)/event/${event.id}`}>
      <View
        className="flex-row items-start p-3 gap-2 border-2 rounded-lg bg-white "
        style={{
          borderColor: event.color,
          width: "100%",
          height: "100%",
        }}
      >
        <View
          className="w-2 rounded-full h-full"
          style={{
            backgroundColor: event.color,
          }}
        ></View>
        <View className="flex-col flex-1">
          <View className="flex-col items-start gap-1 overflow-hidden">
            <Text className="text-xl text-black">{event.name}</Text>
            <Text className="text-gray-500 text-sm">{`${format(
              new Date(event.displayStart),
              "HH:mm"
            )} - ${format(new Date(event.displayEnd), "HH:mm")}`}</Text>
            <View className="flex-row relative justify-start">
              {event.assignees?.map((m: any, idx: number) => (
                <Image
                  key={idx}
                  source={images.john_doe}
                  className="rounded-full size-5 -mr-2"
                  resizeMode="cover"
                />
              ))}
            </View>
          </View>

          <View className="flex-row flex-wrap items-center gap-2 overflow-hidden">
            {event?.tags?.map((t: string, idx: number) => (
              <Text
                className="bg-black/20 rounded-lg p-1 px-2 text-black text-xs"
                key={idx}
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
