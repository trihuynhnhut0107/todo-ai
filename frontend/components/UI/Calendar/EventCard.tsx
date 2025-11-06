import { View, Text, Image, Pressable } from "react-native";
import React from "react";
import { Link } from "expo-router";
import { images } from "@/lib/image";
import { Ionicons } from "@expo/vector-icons";
import { EventCardProps } from "@/type";

const EventCard = ({
  event,
  onPress,
}: {
  event: EventCardProps;
  onPress: (id: string) => void;
}) => {
  return (
    <Link href={`/(main)/event/${event.id}`}>
      <View
        className="flex-row items-start p-3"
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        <View className="flex-1">
          <View className="flex-row relative">
            {event.assignees?.map((m: any, idx: number) => (
              <Image
                key={idx}
                source={images.john_doe}
                className="rounded-full size-4"
                resizeMode="cover"
              />
            ))}
          </View>
          <Text style={{ color: "white", fontSize: 10 }}>{event.name}</Text>
          <Text style={{ color: "white", fontSize: 10 }}>
            {new Date(event.start.dateTime).toLocaleString()}
          </Text>
          <Text style={{ color: "white", fontSize: 10 }}>
            {new Date(event.end.dateTime).toLocaleString()}
          </Text>
        </View>
        <Pressable
          className="rounded-full p-2 z-10"
          onPress={() => onPress(event.id)}
        >
          <Ionicons name="close" size={22} color="white" />
        </Pressable>
      </View>
    </Link>
  );
};

export default EventCard;
