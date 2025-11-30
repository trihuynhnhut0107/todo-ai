import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { registerForPushNotificationsAsync } from "../../../services/notification";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import useAuthStore from "@/store/auth.store";
import SearchInput from "@/components/Input/SearchInput";
import { Link, router } from "expo-router";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/theme.store";

const Header = () => {
  const { user, logout } = useAuthStore();
  const color = useThemeStore();
  const confirmLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout(); // your logout function here
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-1 gap-2">
        <View className="flex-row items-center justify-between">
          <View className=" gap-2 bg-white/30 rounded-lg p-2">
            <View className="flex-row items-center gap-2">
              <FontAwesome6 name="calendar" size={20} color="white" />
              <Text className="text-md text-white">
                {format(new Date(), "MMM dd,yyyy")}
              </Text>
            </View>
            <Text className="text-white text-xs">{user?.email}</Text>
          </View>
          <View className="ml-4 flex-row gap-3 items-center bg-white/30 p-1 rounded-lg">
            <ThemeToggle />
            <Link href={"/(main)/(tabs)/notification"}>
              <View className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center">
                <FontAwesome6 name="bell" size={20} color="white" />
              </View>
            </Link>

            <TouchableOpacity
              onPress={confirmLogout}
              className="w-10 h-10 bg-white/30  rounded-full flex items-center justify-center"
            >
              <Ionicons name="log-out-outline" size={20} color={"white"} />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-5xl font-bold text-white">
          Good afternoon, {user?.name}
        </Text>
      </View>
    </View>
  );
};
const SearchBar = () => (
  <View className="my-2">
    <SearchInput
      placeholder="Ask me about anything!"
      onSubmitEditing={(e) => {
        const searchText = e.nativeEvent.text;
        router.push(`/(main)/chat?query=${encodeURIComponent(searchText)}`);
      }}
    />
  </View>
);

export default function Index() {
  const [expoPushToken, setExpoPushToken] = useState("");
  useEffect(() => {
    // Lấy token và lưu lại (ví dụ: gửi lên server)
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        // TODO: Gửi token này lên backend của bạn
        // fetch('https://api.yourserver.com/register-token', {
        //   method: 'POST',
        //   body: JSON.stringify({ token: token }),
        // });
      }
    });
  }, []);
  return (
    <View className="flex-1 -mb-10 p-4 ">
      <View className="">
        <Header />
        <SearchBar />
      </View>

      <ScrollView className="flex-1 " contentContainerClassName="pb-20">
        <View className="bg-surface p-4 rounded-xl shadow-sm mb-3 flex-row items-center gap-4">
          <FontAwesome6
            name="face-smile-beam"
            size={30}
            color="rgba(255, 120, 70, 1)"
          />
          <View>
            <Text className="text-lg font-bold text-text">Your mood</Text>
            <Text className="text-text mt-1 opacity-50">
              How are you feeling now? Grateful
            </Text>
          </View>
        </View>

        <View className="flex-1 bg-surface p-4 rounded-xl shadow-sm mb-3">
          <Text className="font-semibold text-text opacity-50">Reminder</Text>
          <Text className="font-bold text-lg text-text mt-2">Học bài</Text>
          <Text className="text-text opacity-50">06:00 PM</Text>
          <View className="flex-row gap-2 mt-3">
            <TouchableOpacity className="flex-row items-center bg-green-100 p-2 rounded-full">
              <FontAwesome6 name="check-circle" size={12} color="green" />
              <Text className="text-green-800 ml-1 text-xs font-semibold">
                Took
              </Text>
            </TouchableOpacity>
            <TouchableOpacity className="flex-row items-center bg-yellow-100 p-2 rounded-full">
              <FontAwesome6 name="clock" size={12} color="#854d0e" />
              <Text className="text-yellow-800 ml-1 text-xs font-semibold">
                Snooze
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 bg-surface p-4 rounded-xl shadow-sm mb-3">
          <Text className="font-semibold text-text opacity-50">
            Appointment
          </Text>
          <Text className="font-bold text-lg text-text mt-2">Dr. Erica</Text>
          <Text className="text-text opacity-50">Therapy - 02:00 PM</Text>
          <TouchableOpacity className="flex-row items-center bg-blue-100 p-2 rounded-full mt-3 self-start">
            <FontAwesome6 name="map" size={12} color="#1e40af" />
            <Text className="text-blue-800 ml-1 text-xs font-semibold">
              Get Directions
            </Text>
          </TouchableOpacity>
        </View>

        <View className=" bg-surface p-4 rounded-xl shadow-sm ">
          <View className="flex-row justify-between items-center">
            <Text className="text-lg text-text font-bold">To-do list</Text>
          </View>
          <View className="mt-4 space-y-3">
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-accent rounded-md mr-3" />
              <Text className="text-base text-text opacity-50">
                Schedule blood work
              </Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-accent rounded-md mr-3" />
              <Text className="text-base text-text opacity-50">
                Pick up medication
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
