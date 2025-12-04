import { AntDesign, FontAwesome6, Ionicons } from "@expo/vector-icons";
import { registerForPushNotificationsAsync } from "../../../services/notification";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import useAuthStore from "@/store/auth.store";
import SearchInput from "@/components/Input/SearchInput";
import { Link, router } from "expo-router";
import { format } from "date-fns";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useThemeStore } from "@/store/theme.store";
import useThemeColor from "@/hooks/useThemeColor";
import CustomInput from "@/components/Input/CustomInput";
import CustomButton from "@/components/Input/CustomButton";
import { useUpdateProfile } from "@/query/user.query";
import z from "zod";
import { Controller, Form, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";

const profileScheme = z.object({
  name: z.string().min(1, "Please enter your name"),
});

const Header = () => {
  const queryClient = useQueryClient();
  const { user, logout } = useAuthStore();
  const [isEdit, setEdit] = useState(false);
  const { mutate: update, isPending: pendingUpdate } = useUpdateProfile();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileScheme),
    defaultValues: {
      name: "",
    },
  });
  useEffect(() => {
    if (user) {
      reset({ name: user.name });
    }
  }, [user]);
  const color = useThemeColor();

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
            queryClient.removeQueries()
            logout(); // your logout function here
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleUpdate = (data: z.infer<typeof profileScheme>) => {
    update({ id: user?.id as string, payload: { name: data.name } });
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

        <View className="bg-surface p-2 rounded-full flex-col gap-2">
          <View className="flex-row items-center gap-2">
            <Ionicons
              name="person-circle-outline"
              size={40}
              color={color.text}
            />
            <View>
              <Text className="text-accent">{user?.name}</Text>
              <Text className="text-text-secondary opacity-70 text-sm">
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setEdit((prev) => !prev)}
              className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center ml-auto"
            >
              <AntDesign name="edit" size={24} color={color.text} />
            </TouchableOpacity>
          </View>

          <Modal visible={isEdit} animationType="fade" transparent>
            {/* backdrop */}
            <TouchableOpacity
              className="flex-1 bg-black/40"
              activeOpacity={1}
              onPress={() => setEdit(false)}
            />
            <View className="absolute left-6 right-6 top-36 rounded-2xl p-4 shadow-xl gap-2 bg-surface border-2 border-border">
              <Text className="font-semibold mb-3 text-center text-text text-xl">
                Edit Your Profile
              </Text>

              <Controller
                control={control}
                name="name"
                render={({ field }) => (
                  <View>
                    <CustomInput
                      value={field.value}
                      onChangeText={field.onChange}
                      label="Username"
                      placeholder="Enter your username"
                      error={!!errors.name}
                    />
                    <Text className="text-red-500">{errors.name?.message}</Text>
                  </View>
                )}
              />
              <CustomButton
                isLoading={pendingUpdate}
                onPress={handleSubmit(handleUpdate)}
                title="Update"
              />
            </View>
          </Modal>
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
